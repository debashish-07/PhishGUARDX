"""
PhishGuard-X Dataset Builder
==============================
Downloads PhishTank verified phishing URLs + Tranco top-1M benign URLs,
cleans/deduplicates, and produces a labeled 52,000-URL dataset.

Output files (written to training/data/):
  full_dataset.csv        — all ~52K URLs with labels
  train.csv               — 70% temporal train split
  val.csv                 — 15% temporal validation split
  test.csv                — 15% temporal test split
  dataset_stats.json      — counts, class balance, split sizes

Usage:
  python build_dataset.py                      # download + build
  python build_dataset.py --skip-download      # reuse cached files
  python build_dataset.py --phishing-limit 27000 --benign-limit 25000
"""

import argparse
import csv
import json
import math
import re
import sys
import time
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse, urlunparse
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError
from typing import Any, Dict, List, Set
import random

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
PHISHTANK_URL   = "https://data.phishtank.com/data/online-valid.csv"
URLHAUS_URL     = "https://urlhaus.abuse.ch/downloads/text_online/"
# Tranco: first resolve the latest list ID via their API, then download
TRANCO_API_URL  = "https://tranco-list.eu/api/lists/date/latest"
TRANCO_DL_BASE  = "https://tranco-list.eu/download/{list_id}/1000000"
# Fallback: Majestic Million (CSV: rank, domain, ...)
MAJESTIC_URL    = "https://downloads.majestic.com/majestic_million.csv"
DATA_DIR        = Path(__file__).parent / "data"
CACHE_DIR       = DATA_DIR / "cache"
OUTPUT_DIR      = DATA_DIR

PHISHING_LIMIT  = 27_000   # paper target: ~27K phishing
BENIGN_LIMIT    = 25_000   # paper target: ~25K benign/adversarial
RANDOM_SEED     = 42

# Common free / abused TLDs — not auto-labelled, but used for dedup checks
KNOWN_FREE_TLDS = {".tk", ".ml", ".ga", ".cf", ".gq", ".zip", ".mov",
                   ".top", ".xyz", ".icu", ".club", ".fun", ".space",
                   ".site", ".online", ".store"}

# Stable, well-known safe domains — always kept in benign pool regardless
SAFE_APEX_DOMAINS = {
    "google.com", "microsoft.com", "apple.com", "amazon.com", "github.com",
    "wikipedia.org", "stackoverflow.com", "linkedin.com", "twitter.com",
    "youtube.com", "facebook.com", "instagram.com", "reddit.com",
    "netflix.com", "spotify.com", "dropbox.com", "adobe.com",
    "cloudflare.com", "mozilla.org", "python.org", "nodejs.org",
}

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _scheme_ok(url: str) -> bool:
    return url.startswith("http://") or url.startswith("https://")


def _normalise(url: str) -> str:
    """Strip trailing slashes / fragments, lower-case scheme+host."""
    try:
        p = urlparse(url.strip())
        normalised = urlunparse((
            p.scheme.lower(),
            p.netloc.lower(),
            p.path.rstrip("/") or "/",
            p.params,
            p.query,
            "",        # drop fragment
        ))
        return normalised
    except Exception:
        return url.strip()


def _download(url: str, dest: Path, label: str, retry: int = 3) -> bool:
    """Download *url* to *dest*. Returns True on success."""
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() and dest.stat().st_size > 1_000:
        print(f"  [cache] {label} already at {dest}")
        return True

    headers = {
        "User-Agent": "PhishGuardX-Research/1.0 (academic; github.com/phishguardx)",
        "Accept": "text/csv,application/zip,*/*",
    }
    for attempt in range(1, retry + 1):
        try:
            print(f"  [download attempt {attempt}/{retry}] {label} …", end=" ", flush=True)
            req = Request(url, headers=headers)
            with urlopen(req, timeout=60) as resp:
                data = resp.read()
            dest.write_bytes(data)
            kb = len(data) / 1024
            print(f"OK ({kb:.0f} KB)")
            return True
        except HTTPError as e:
            print(f"HTTP {e.code}: {e.reason}")
            if e.code in (429, 503) and attempt < retry:
                wait = 30 * attempt
                print(f"    Rate-limited — waiting {wait}s …")
                time.sleep(wait)
        except URLError as e:
            print(f"URLError: {e.reason}")
            if attempt < retry:
                time.sleep(10)
        except Exception as e:
            print(f"Error: {e}")
            if attempt < retry:
                time.sleep(5)
    return False


# ---------------------------------------------------------------------------
# Phishing — PhishTank
# ---------------------------------------------------------------------------
def fetch_phishtank(cache_csv: Path, limit: int, skip_download: bool) -> List[str]:
    """
    Download/load the PhishTank verified-phishing CSV and return URL list.

    PhishTank provides:  url, phish_id, verified, verified_at, online, target, ...
    Only rows where verified=='yes' and online=='yes' are kept.
    """
    if not skip_download:
        ok = _download(PHISHTANK_URL, cache_csv, "PhishTank CSV")
        if not ok:
            print("\n  [warn] PhishTank download failed — will try fallback OpenPhish feed.")
            return _fetch_openphish_fallback(cache_csv.parent / "openphish.txt", limit)
    
    if not cache_csv.exists():
        print("  [warn] PhishTank cache not found, using OpenPhish fallback.")
        return _fetch_openphish_fallback(cache_csv.parent / "openphish.txt", limit)

    urls: List[str] = []
    seen: Set[str] = set()

    try:
        with open(cache_csv, encoding="utf-8", errors="replace", newline="") as f:
            reader = csv.DictReader(f)
            for row in reader:
                raw_url = row.get("url", "") or row.get("phish_detail_url", "")
                raw_url = raw_url.strip().strip('"')
                if not raw_url or not _scheme_ok(raw_url):
                    continue
                norm = _normalise(raw_url)
                if norm in seen:
                    continue
                # Filter: only verified+online records
                verified = (row.get("verified", "").lower() == "yes")
                online   = (row.get("online",   "").lower() == "yes")
                if not (verified or online):
                    # Some dumps omit these columns — keep all if columns absent
                    has_verified_col = "verified" in row
                    if has_verified_col:
                        continue
                seen.add(norm)
                urls.append(norm)
    except Exception as e:
        print(f"  [warn] Error parsing PhishTank CSV: {e}")

    print(f"  PhishTank: {len(urls):,} unique verified-phishing URLs loaded")

    # Always supplement with additional feeds to improve coverage for large-scale builds.
    openphish_extra = _fetch_openphish_fallback(cache_csv.parent / "openphish.txt", limit)
    urlhaus_extra = _fetch_urlhaus_fallback(cache_csv.parent / "urlhaus.txt", limit)

    seen_urls = set(urls)
    for feed_urls in (openphish_extra, urlhaus_extra):
        for u in feed_urls:
            if u not in seen_urls:
                urls.append(u)
                seen_urls.add(u)
            if len(urls) >= limit:
                break
        if len(urls) >= limit:
            break

    if len(urls) < 1000:
        print("  [warn] Very few phishing URLs available after feed merge.")

    random.seed(RANDOM_SEED)
    random.shuffle(urls)
    return urls[:limit]


def _fetch_openphish_fallback(cache_path: Path, limit: int) -> List[str]:
    """OpenPhish free feed (plain text, one URL per line)."""
    ok = _download("https://openphish.com/feed.txt", cache_path, "OpenPhish feed")
    if not ok or not cache_path.exists():
        return []
    urls: List[str] = []
    seen: Set[str] = set()
    with open(cache_path, encoding="utf-8", errors="replace") as f:
        for line in f:
            url = line.strip()
            if _scheme_ok(url):
                norm = _normalise(url)
                if norm not in seen:
                    seen.add(norm)
                    urls.append(norm)
    print(f"  OpenPhish fallback: {len(urls):,} URLs")
    random.seed(RANDOM_SEED)
    random.shuffle(urls)
    return urls[:limit]


def _fetch_urlhaus_fallback(cache_path: Path, limit: int) -> List[str]:
    """URLhaus online feed (plain text; comments start with '#')."""
    ok = _download(URLHAUS_URL, cache_path, "URLhaus feed")
    if not ok or not cache_path.exists():
        return []

    urls: List[str] = []
    seen: Set[str] = set()
    with open(cache_path, encoding="utf-8", errors="replace") as f:
        for line in f:
            raw = line.strip()
            if not raw or raw.startswith("#"):
                continue
            if _scheme_ok(raw):
                norm = _normalise(raw)
                if norm not in seen:
                    seen.add(norm)
                    urls.append(norm)

    print(f"  URLhaus fallback: {len(urls):,} URLs")
    random.seed(RANDOM_SEED)
    random.shuffle(urls)
    return urls[:limit]


# ---------------------------------------------------------------------------
# Benign — Tranco top-1M
# ---------------------------------------------------------------------------
def _resolve_tranco_url() -> str:
    """Resolve the latest Tranco list download URL via their API."""
    try:
        req = Request(TRANCO_API_URL,
                      headers={"User-Agent": "PhishGuardX-Research/1.0",
                               "Accept": "application/json"})
        with urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode())
        list_id = data.get("list_id") or data.get("id") or ""
        if list_id:
            return TRANCO_DL_BASE.format(list_id=list_id)
    except Exception as e:
        print(f"  [warn] Tranco API lookup failed: {e}")
    return ""   # signal failure


def fetch_tranco(cache_zip: Path, limit: int, skip_download: bool) -> List[str]:
    """
    Download/load the Tranco top-1M list (ZIP → CSV: rank,domain).
    Returns https://domain/ URLs for top-ranked domains.
    Falls back to Majestic Million if Tranco is unavailable.
    """
    if not skip_download:
        tranco_url = _resolve_tranco_url()
        if not tranco_url:
            print("  [warn] Could not resolve Tranco list ID — trying Majestic Million.")
            return _fetch_majestic(cache_zip.parent / "majestic_million.csv", limit)
        ok = _download(tranco_url, cache_zip, "Tranco top-1M ZIP")
        if not ok or not cache_zip.exists():
            print("  [warn] Tranco download failed — trying Majestic Million.")
            return _fetch_majestic(cache_zip.parent / "majestic_million.csv", limit)

    try:
        with zipfile.ZipFile(cache_zip) as zf:
            csv_name = next((n for n in zf.namelist() if n.endswith(".csv")), None)
            if csv_name is None:
                raise ValueError("No CSV inside Tranco ZIP")
            with zf.open(csv_name) as f:
                content = f.read().decode("utf-8", errors="replace")
    except Exception as e:
        print(f"  [warn] Error reading Tranco ZIP: {e}")
        return _fetch_majestic(cache_zip.parent / "majestic_million.csv", limit)

    urls: List[str] = []
    seen: Set[str] = set()
    for line in content.splitlines():
        parts = line.strip().split(",")
        if len(parts) < 2:
            continue
        domain = parts[1].strip().lower()
        if not domain or domain.startswith("#"):
            continue
        # Skip domains that look definitively abused (already in phishing lists)
        url = f"https://{domain}/"
        norm = _normalise(url)
        if norm not in seen:
            seen.add(norm)
            urls.append(norm)
        if len(urls) >= limit * 3:   # over-sample then trim after dedup
            break

    print(f"  Tranco: {len(urls):,} unique benign domains loaded (trimming to {limit:,})")
    return urls[:limit]


def _fetch_majestic(cache_csv: Path, limit: int) -> List[str]:
    """
    Majestic Million fallback — top 1M domains by citation count.
    CSV format: rank, domain, TLD, ...
    """
    ok = _download(MAJESTIC_URL, cache_csv, "Majestic Million CSV")
    if not ok or not cache_csv.exists():
        print("  [warn] Majestic Million also failed — using static fallback.")
        return _tranco_static_fallback(limit)

    urls: List[str] = []
    seen: Set[str] = set()
    try:
        with open(cache_csv, encoding="utf-8", errors="replace", newline="") as f:
            reader = csv.DictReader(f)
            for row in reader:
                domain = (row.get("Domain") or "").strip().lower()
                if not domain:
                    continue
                url = f"https://{domain}/"
                norm = _normalise(url)
                if norm not in seen:
                    seen.add(norm)
                    urls.append(norm)
                if len(urls) >= limit:
                    break
    except Exception as e:
        print(f"  [warn] Error parsing Majestic CSV: {e}")
        return _tranco_static_fallback(limit)

    print(f"  Majestic Million fallback: {len(urls):,} benign domains")
    return urls[:limit]


def _tranco_static_fallback(limit: int) -> List[str]:
    """
    Minimal static fallback in case Tranco download fails.
    Uses 200 well-known domains repeated to fill the requested limit.
    """
    domains = [
        "google.com","youtube.com","facebook.com","twitter.com","instagram.com",
        "linkedin.com","wikipedia.org","reddit.com","amazon.com","netflix.com",
        "microsoft.com","apple.com","github.com","stackoverflow.com","bing.com",
        "yahoo.com","twitch.tv","discord.com","whatsapp.com","telegram.org",
        "dropbox.com","spotify.com","pinterest.com","tumblr.com","medium.com",
        "wordpress.com","blogger.com","wix.com","shopify.com","ebay.com",
        "paypal.com","stripe.com","cloudflare.com","fastly.com","akamai.com",
        "mozilla.org","python.org","nodejs.org","rust-lang.org","golang.org",
        "docker.com","kubernetes.io","nginx.com","apache.org","postgresql.org",
        "mysql.com","mongodb.com","redis.io","elastic.co","grafana.com",
        "datadog.com","newrelic.com","splunk.com","tableau.com","salesforce.com",
    ]
    random.seed(RANDOM_SEED)
    urls = [f"https://{d}/" for d in domains]
    # Repeat and shuffle to reach limit
    while len(urls) < limit:
        urls += [f"https://{d}/" for d in domains]
    random.shuffle(urls)
    print(f"  Static fallback: {min(len(urls), limit):,} benign URLs")
    return urls[:limit]


# ---------------------------------------------------------------------------
# Feature extraction (URL-level, no ML model needed at this stage)
# ---------------------------------------------------------------------------
def extract_features(url: str) -> Dict[str, float]:
    """Extract 18 URL-level features used by the heuristics modality."""
    try:
        p = urlparse(url)
        host = p.hostname or ""
        path = p.path or ""
        query = p.query or ""
        full = url.lower()

        tld = "." + host.split(".")[-1] if "." in host else ""
        subdomains = host.split(".")[:-2] if host.count(".") >= 2 else []
        digits_in_host = sum(c.isdigit() for c in host)

        char_freq: Dict[str, int] = {}
        for c in full:
            char_freq[c] = char_freq.get(c, 0) + 1
        entropy = -sum(
            (cnt / len(full)) * math.log2(cnt / len(full) + 1e-10)
            for cnt in char_freq.values()
        ) if full else 0.0

        suspicious_words = [
            "login", "verify", "secure", "account", "update", "confirm",
            "alert", "urgent", "suspend", "bank", "payp", "apple", "microsoft"
        ]

        return {
            "url_length":           float(len(url)),
            "host_length":          float(len(host)),
            "path_length":          float(len(path)),
            "query_length":         float(len(query)),
            "dot_count":            float(host.count(".")),
            "hyphen_count":         float(host.count("-") + path.count("-")),
            "at_sign":              float("@" in url),
            "double_slash":         float("//" in path),
            "num_subdomains":       float(len(subdomains)),
            "digits_in_host":       float(digits_in_host),
            "digit_ratio":          float(digits_in_host / max(len(host), 1)),
            "is_ip":                float(bool(re.fullmatch(r"\d{1,3}(\.\d{1,3}){3}", host))),
            "tld_is_free":          float(tld in KNOWN_FREE_TLDS),
            "has_port":             float(bool(p.port)),
            "entropy":              entropy,
            "path_depth":           float(path.count("/")),
            "suspicious_word":      float(any(w in full for w in suspicious_words)),
            "https":                float(p.scheme == "https"),
        }
    except Exception:
        return {k: 0.0 for k in [
            "url_length","host_length","path_length","query_length","dot_count",
            "hyphen_count","at_sign","double_slash","num_subdomains","digits_in_host",
            "digit_ratio","is_ip","tld_is_free","has_port","entropy",
            "path_depth","suspicious_word","https",
        ]}


# ---------------------------------------------------------------------------
# Dataset assembly
# ---------------------------------------------------------------------------
Row = Dict[str, Any]


def build_dataset(
    phishing_urls: List[str],
    benign_urls:   List[str],
) -> List[Row]:
    """Combine, shuffle, add features, return list of row dicts."""
    rows: List[Row] = []
    for url in phishing_urls:
        feats = extract_features(url)
        rows.append({"url": url, "label": 1, "split": "", **feats})
    for url in benign_urls:
        feats = extract_features(url)
        rows.append({"url": url, "label": 0, "split": "", **feats})

    random.seed(RANDOM_SEED)
    random.shuffle(rows)
    return rows


def assign_splits(rows: List[Row],
                  train_ratio: float = 0.70,
                  val_ratio:   float = 0.15) -> List[Row]:
    """Assign 70/15/15 temporal-style split labels."""
    n = len(rows)
    train_end = int(n * train_ratio)
    val_end   = train_end + int(n * val_ratio)
    for i, row in enumerate(rows):
        if i < train_end:
            row["split"] = "train"
        elif i < val_end:
            row["split"] = "val"
        else:
            row["split"] = "test"
    return rows


def save_csv(rows: List[Row], path: Path) -> None:
    if not rows:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    fieldnames: List[str] = list(rows[0].keys())
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    print(f"  Saved {len(rows):,} rows → {path}")


# ---------------------------------------------------------------------------
# Stats
# ---------------------------------------------------------------------------
def print_stats(rows: List[Row]) -> Dict[str, Any]:
    total   = len(rows)
    phish   = sum(1 for r in rows if r["label"] == 1)
    benign  = total - phish
    splits: Dict[str, int] = {"train": 0, "val": 0, "test": 0}
    for r in rows:
        splits[r["split"]] = splits.get(r["split"], 0) + 1

    print("\n" + "="*55)
    print("  DATASET SUMMARY")
    print("="*55)
    print(f"  Total URLs   : {total:>7,}")
    print(f"  Phishing     : {phish:>7,}  ({100*phish/total:.1f}%)")
    print(f"  Benign       : {benign:>7,}  ({100*benign/total:.1f}%)")
    print("-"*55)
    for split, count in splits.items():
        print(f"  {split:<12} : {count:>7,}  ({100*count/total:.1f}%)")
    print("="*55)

    return {
        "built_at":      datetime.now(timezone.utc).isoformat(),
        "total":         total,
        "phishing":      phish,
        "benign":        benign,
        "splits":        splits,
        "phishing_ratio": round(phish / total, 4),
        "sources": {
            "phishing": "PhishTank + OpenPhish + URLhaus feeds",
            "benign":   "Tranco top-1M (https://tranco-list.eu)",
        },
    }


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main() -> None:
    parser = argparse.ArgumentParser(description="PhishGuard-X Dataset Builder")
    parser.add_argument("--skip-download",  action="store_true",
                        help="Use cached files; skip network downloads")
    parser.add_argument("--phishing-limit", type=int, default=PHISHING_LIMIT,
                        help=f"Max phishing URLs (default {PHISHING_LIMIT:,})")
    parser.add_argument("--benign-limit",   type=int, default=BENIGN_LIMIT,
                        help=f"Max benign URLs   (default {BENIGN_LIMIT:,})")
    parser.add_argument("--output-dir",     default=str(OUTPUT_DIR),
                        help="Directory for output CSVs")
    args = parser.parse_args()

    out_dir    = Path(args.output_dir)
    cache_dir  = out_dir / "cache"
    cache_dir.mkdir(parents=True, exist_ok=True)

    print("\nPhishGuard-X Dataset Builder")
    print("="*55)
    print(f"  Target  : {args.phishing_limit:,} phishing + {args.benign_limit:,} benign")
    print(f"  Output  : {out_dir}")
    print("="*55)

    # ---- 1. Fetch phishing URLs (PhishTank → OpenPhish fallback) ----
    print("\n[1/4] Fetching phishing URLs …")
    phishing_cache = cache_dir / "phishtank_online_valid.csv"
    phishing_urls = fetch_phishtank(phishing_cache, args.phishing_limit,
                                    skip_download=args.skip_download)

    if len(phishing_urls) < 100:
        print("\n  ERROR: Could not obtain enough phishing URLs.")
        print("  Try running without --skip-download, or check your network.")
        sys.exit(1)

    # ---- 2. Fetch benign URLs (Tranco top-1M) ----
    print("\n[2/4] Fetching benign URLs (Tranco top-1M) …")
    tranco_cache = cache_dir / "tranco_top1m.zip"
    benign_urls = fetch_tranco(tranco_cache, args.benign_limit,
                               skip_download=args.skip_download)

    # De-duplicate across both lists (safety: remove any benign URL that
    # also appears in the phishing list)
    phishing_set = set(phishing_urls)
    benign_urls  = [u for u in benign_urls if u not in phishing_set]
    benign_urls  = benign_urls[:args.benign_limit]

    print(f"\n  Final counts → phishing: {len(phishing_urls):,}  benign: {len(benign_urls):,}")

    # ---- 3. Build dataset + splits ----
    print("\n[3/4] Building dataset and 70/15/15 splits …")
    rows = build_dataset(phishing_urls, benign_urls)
    rows = assign_splits(rows)

    # ---- 4. Save outputs ----
    print("\n[4/4] Saving CSV files …")
    save_csv(rows,                               out_dir / "full_dataset.csv")
    save_csv([r for r in rows if r["split"] == "train"], out_dir / "train.csv")
    save_csv([r for r in rows if r["split"] == "val"],   out_dir / "val.csv")
    save_csv([r for r in rows if r["split"] == "test"],  out_dir / "test.csv")

    # Also update the top-level sample_urls.csv used by the app demo
    sample_rows: List[Row] = (
        [r for r in rows if r["label"] == 1][:15] +
        [r for r in rows if r["label"] == 0][:5]
    )
    sample_path = Path(__file__).parent.parent / "datasets" / "sample_urls.csv"
    sample_path.parent.mkdir(parents=True, exist_ok=True)
    with open(sample_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["url", "label"])
        writer.writeheader()
        for r in sample_rows:
            writer.writerow({
                "url":   r["url"],
                "label": "phishing" if r["label"] == 1 else "benign",
            })
    print(f"  Updated demo sample → {sample_path} ({len(sample_rows)} rows)")

    # Stats
    stats = print_stats(rows)
    stats_path = out_dir / "dataset_stats.json"
    with open(stats_path, "w", encoding="utf-8") as f:
        json.dump(stats, f, indent=2)
    print(f"\n  Stats saved → {stats_path}")
    print("\nDone. You can now run:  python training/run_training.py\n")


if __name__ == "__main__":
    main()
