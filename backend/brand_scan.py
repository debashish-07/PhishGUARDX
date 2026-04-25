from __future__ import annotations

import socket
import ssl
from dataclasses import dataclass
from typing import Dict, List, Set

from .runtime import engine


_HOMOGLYPH_MAP = {
    "a": "@",
    "e": "3",
    "i": "1",
    "o": "0",
    "s": "$",
    "l": "1",
}


@dataclass(frozen=True)
class CandidateDomain:
    domain: str
    mutation_type: str


def _split_domain(domain: str) -> tuple[str, str]:
    clean = domain.strip().lower()
    parts = clean.split(".")
    if len(parts) < 2:
        return clean, "com"
    return ".".join(parts[:-1]), parts[-1]


def _generate_insertion(base: str, tld: str) -> List[CandidateDomain]:
    out: List[CandidateDomain] = []
    for i, ch in enumerate(base[:6]):
        out.append(CandidateDomain(f"{base[:i]}{ch}{base[i:]}.{tld}", "insertion"))
    return out


def _generate_deletion(base: str, tld: str) -> List[CandidateDomain]:
    out: List[CandidateDomain] = []
    for i in range(min(len(base), 6)):
        mutated = base[:i] + base[i + 1 :]
        if len(mutated) >= 3:
            out.append(CandidateDomain(f"{mutated}.{tld}", "deletion"))
    return out


def _generate_addition(base: str, tld: str) -> List[CandidateDomain]:
    suffixes = ["secure", "verify", "login", "support", "account"]
    return [CandidateDomain(f"{base}{suffix}.{tld}", "addition") for suffix in suffixes]


def _generate_homoglyph(base: str, tld: str) -> List[CandidateDomain]:
    out: List[CandidateDomain] = []
    for i, ch in enumerate(base):
        repl = _HOMOGLYPH_MAP.get(ch)
        if repl:
            out.append(CandidateDomain(f"{base[:i]}{repl}{base[i + 1 :]}.{tld}", "homoglyph"))
            if len(out) >= 5:
                break
    return out


def _generate_vowel_swap(base: str, tld: str) -> List[CandidateDomain]:
    vowels = "aeiou"
    out: List[CandidateDomain] = []
    for i, ch in enumerate(base):
        if ch in vowels:
            for replacement in vowels:
                if replacement != ch:
                    out.append(CandidateDomain(f"{base[:i]}{replacement}{base[i + 1 :]}.{tld}", "vowel-swap"))
            if len(out) >= 6:
                break
    return out


def generate_candidates(domain: str, limit: int = 40) -> List[CandidateDomain]:
    base, tld = _split_domain(domain)
    raw: List[CandidateDomain] = []
    raw.extend(_generate_insertion(base, tld))
    raw.extend(_generate_deletion(base, tld))
    raw.extend(_generate_addition(base, tld))
    raw.extend(_generate_homoglyph(base, tld))
    raw.extend(_generate_vowel_swap(base, tld))

    seen: Set[str] = set()
    unique: List[CandidateDomain] = []
    for item in raw:
        if item.domain == domain or item.domain in seen:
            continue
        seen.add(item.domain)
        unique.append(item)
        if len(unique) >= limit:
            break
    return unique


def resolve_ip(domain: str) -> str:
    try:
        return socket.gethostbyname(domain)
    except Exception:
        return "unresolved"


def resolve_mx(domain: str) -> bool:
    try:
        import dns.resolver  # type: ignore

        answers = dns.resolver.resolve(domain, "MX")
        return len(list(answers)) > 0
    except Exception:
        return False


def check_ssl(domain: str, timeout: float = 2.0) -> bool:
    try:
        ctx = ssl.create_default_context()
        with socket.create_connection((domain, 443), timeout=timeout) as sock:
            with ctx.wrap_socket(sock, server_hostname=domain):
                return True
    except Exception:
        return False


def scan_brand_domain(domain: str, model_type: str = "rf") -> List[Dict]:
    rows: List[Dict] = []
    for candidate in generate_candidates(domain):
        analysis = engine.analyze_url(f"http://{candidate.domain}", model_type=model_type)
        rows.append(
            {
                "domain": candidate.domain,
                "type": candidate.mutation_type,
                "risk_score": analysis["risk_score"],
                "verdict": analysis["label"],
                "reasons": analysis.get("reasons", []),
                "ip": resolve_ip(candidate.domain),
                "mx": resolve_mx(candidate.domain),
                "ssl": check_ssl(candidate.domain),
            }
        )

    rows.sort(key=lambda r: r["risk_score"], reverse=True)
    return rows
