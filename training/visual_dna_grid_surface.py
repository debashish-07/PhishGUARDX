"""
Visual DNA Grid/Surface Generator

Creates presentation-ready Visual DNA outputs using:
- 2D heatmap (plt.imshow)
- 3D smooth surface (plot_surface)

The output intentionally emphasizes pattern differences:
- Legitimate URLs -> clustered/structured distributions
- Phishing DGA-style URLs -> noisy distributions

Run:
  python training/visual_dna_grid_surface.py
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import hashlib
import math
import re
from urllib.parse import urlparse

import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap
from matplotlib.patches import Circle
import numpy as np
from PIL import Image


OUTPUT_DIR = Path(__file__).parent / "results" / "visual_dna"
GRID_SIZE = 32


@dataclass(frozen=True)
class UrlSample:
    label: str
    category: str
    url: str


LEGIT_URLS = [
    UrlSample("legit_google", "legitimate", "https://accounts.google.com/signin/v2/identifier"),
    UrlSample("legit_github", "legitimate", "https://github.com/login?return_to=%2Ffeatures"),
    UrlSample("legit_microsoft", "legitimate", "https://login.microsoftonline.com/common/oauth2/authorize"),
]

PHISHING_DGA_URLS = [
    UrlSample("dga_1", "phishing_dga", "http://xk2q9m-login-secure-verify-paypal.com.account-update.ru/login"),
    UrlSample("dga_2", "phishing_dga", "http://qz7h3n8v2-auth-check-banking-update.top/secure/verify"),
    UrlSample("dga_3", "phishing_dga", "http://m9k2r5x1s7-notice-confirm-session.xyz/portal/check"),
]


def entropy(text: str) -> float:
    if not text:
        return 0.0
    counts = {}
    for ch in text:
        counts[ch] = counts.get(ch, 0) + 1
    probs = np.array([c / len(text) for c in counts.values()], dtype=np.float64)
    return float(-(probs * np.log2(probs + 1e-12)).sum())


def dga_likelihood(hostname: str) -> float:
    if not hostname:
        return 0.0
    h = hostname.lower()
    ent = entropy(h)
    digit_ratio = sum(ch.isdigit() for ch in h) / max(1, len(h))
    hyphen_ratio = h.count("-") / max(1, len(h))
    vowel_ratio = sum(ch in "aeiou" for ch in h) / max(1, len(h))

    # Heuristic score in [0, 1], higher means more DGA-like randomness.
    score = 0.0
    score += min(1.0, ent / 4.5) * 0.45
    score += min(1.0, digit_ratio * 4.0) * 0.25
    score += min(1.0, hyphen_ratio * 3.0) * 0.15
    score += (1.0 - min(1.0, vowel_ratio * 3.0)) * 0.15
    return float(np.clip(score, 0.0, 1.0))


def char_value(ch: str) -> float:
    if ch.isdigit():
        return 0.75
    if ch.isalpha():
        base = (ord(ch.lower()) - 97) / 25.0
        return 0.25 + 0.45 * np.clip(base, 0.0, 1.0)
    if ch in "./?&=_-":
        return 0.9
    return 0.55


def smooth_grid(grid: np.ndarray, rounds: int = 1) -> np.ndarray:
    kernel = np.array(
        [
            [1.0, 2.0, 1.0],
            [2.0, 4.0, 2.0],
            [1.0, 2.0, 1.0],
        ],
        dtype=np.float64,
    )
    kernel /= kernel.sum()

    out = grid.copy().astype(np.float64)
    for _ in range(max(1, rounds)):
        padded = np.pad(out, ((1, 1), (1, 1)), mode="reflect")
        nxt = np.zeros_like(out)
        for r in range(out.shape[0]):
            for c in range(out.shape[1]):
                nxt[r, c] = np.sum(padded[r : r + 3, c : c + 3] * kernel)
        out = nxt
    return out


def build_visual_dna_grid(url: str, size: int = GRID_SIZE) -> tuple[np.ndarray, float]:
    parsed = urlparse(url)
    host = (parsed.hostname or "").lower()
    path = (parsed.path or "").lower()
    query = (parsed.query or "").lower()

    dga_score = dga_likelihood(host)
    grid = np.zeros((size, size), dtype=np.float64)

    host_band = slice(0, size // 3)
    path_band = slice(size // 3, (2 * size) // 3)
    query_band = slice((2 * size) // 3, size)

    def deposit(text: str, band: slice, scale: float) -> None:
        if not text:
            return
        chars = text[: size * size]
        band_rows = np.arange(band.start, band.stop)
        if len(band_rows) == 0:
            return
        for i, ch in enumerate(chars):
            r = int(band_rows[i % len(band_rows)])
            c = int((i * 7 + ord(ch)) % size)
            grid[r, c] += char_value(ch) * scale

    # Base structured deposits
    deposit(host, host_band, 1.0)
    deposit(path, path_band, 0.9)
    deposit(query, query_band, 0.8)

    # Domain token anchors produce visible clusters for legitimate URLs.
    tokens = [t for t in re.split(r"[^a-z0-9]+", host) if t]
    for t_idx, token in enumerate(tokens[:8]):
        center_r = int((t_idx * 3 + len(token)) % (size // 3))
        center_c = int((sum(ord(ch) for ch in token) + t_idx * 11) % size)
        rr = slice(max(0, center_r - 1), min(size // 3, center_r + 2))
        cc = slice(max(0, center_c - 2), min(size, center_c + 3))
        grid[rr, cc] += 0.6

    # DGA-like URLs get deterministic noise overlays to mimic irregular distributions.
    if dga_score > 0.45:
        digest = hashlib.sha256(url.encode("utf-8")).digest()
        seed = int.from_bytes(digest[:8], byteorder="big", signed=False)
        rng = np.random.default_rng(seed)
        noise = rng.random((size, size)) * (0.35 + 0.45 * dga_score)
        grid += noise

    # Smooth legitimate grids more to emphasize cluster structure.
    rounds = 3 if dga_score < 0.45 else 1
    grid = smooth_grid(grid, rounds=rounds)

    # Normalize to [0, 1]
    max_v = float(np.max(grid))
    if max_v > 0:
        grid /= max_v

    return grid, dga_score


def save_cnn_image(grid: np.ndarray, out_path: Path) -> None:
    arr = np.clip(grid * 255.0, 0, 255).astype(np.uint8)
    Image.fromarray(arr, mode="L").save(out_path)


def save_reference_style_poster(sample: UrlSample, grid: np.ndarray, dga_score: float) -> None:
    """Generate a neon cyber poster inspired by the provided reference style."""
    is_legit = sample.category == "legitimate"

    # Match reference-like aspect ratio (~600x551 => 1.089:1)
    fig, ax = plt.subplots(figsize=(10.89, 10.0), dpi=220)
    fig.patch.set_facecolor("#020617")
    ax.set_facecolor("#020617")
    ax.set_xlim(0.0, 1.0)
    ax.set_ylim(0.0, 1.0)
    ax.axis("off")

    # High-contrast dark RGB background with controlled neon glows.
    xx, yy = np.meshgrid(np.linspace(0, 1, 700), np.linspace(0, 1, 900))
    glow_center1 = np.exp(-(((xx - 0.22) ** 2) + ((yy - 0.22) ** 2)) / 0.03)
    glow_center2 = np.exp(-(((xx - 0.75) ** 2) + ((yy - 0.78) ** 2)) / 0.025)
    glow_center3 = np.exp(-(((xx - 0.52) ** 2) + ((yy - 0.52) ** 2)) / 0.06)

    bg_rgb = np.zeros((yy.shape[0], xx.shape[1], 3), dtype=np.float64)
    # Deep navy base + vertical depth gradient
    bg_rgb[..., 0] = 0.01 + 0.02 * (1.0 - yy)
    bg_rgb[..., 1] = 0.03 + 0.05 * (1.0 - yy)
    bg_rgb[..., 2] = 0.10 + 0.12 * (1.0 - yy)
    # Cyan/blue glows
    bg_rgb[..., 1] += 0.10 * glow_center1 + 0.05 * glow_center3
    bg_rgb[..., 2] += 0.22 * glow_center2 + 0.10 * glow_center3
    bg_rgb[..., 0] += 0.03 * glow_center2
    bg_rgb = np.clip(bg_rgb, 0.0, 1.0)
    ax.imshow(bg_rgb, extent=(0, 1, 0, 1), origin="lower", aspect="auto")

    # Stronger red threat glow for phishing/anomalous samples.
    if not is_legit:
        red_glow_1 = np.exp(-(((xx - 0.68) ** 2) + ((yy - 0.78) ** 2)) / 0.02)
        red_glow_2 = np.exp(-(((xx - 0.78) ** 2) + ((yy - 0.58) ** 2)) / 0.03)
        red_mix = 0.65 * red_glow_1 + 0.45 * red_glow_2
        red_layer = np.zeros((yy.shape[0], xx.shape[1], 4), dtype=np.float64)
        red_layer[..., 0] = 1.0
        red_layer[..., 1] = 0.16
        red_layer[..., 2] = 0.20
        red_layer[..., 3] = np.clip(red_mix * 0.35, 0.0, 0.5)
        ax.imshow(red_layer, extent=(0, 1, 0, 1), origin="lower", aspect="auto")

    # Central pseudo-3D DNA-like double helix.
    y = np.linspace(0.08, 0.92, 360)
    x_center = 0.5
    base_amp = 0.11
    freq = 7.8 * np.pi
    phase = freq * y
    depth = 0.5 + 0.5 * np.cos(phase)
    amp = base_amp * (0.72 + 0.32 * depth)
    x1 = x_center + amp * np.sin(phase)
    x2 = x_center - amp * np.sin(phase)

    left_color = "#00d4ff"
    right_color = "#ff3b3b" if not is_legit else "#34d399"

    def draw_glass_strand(xs: np.ndarray, ys: np.ndarray, color: str, depth_arr: np.ndarray, dir_sign: float) -> None:
        # Soft outer glow
        ax.plot(xs, ys, color=color, lw=15.4, alpha=0.085)
        ax.plot(xs, ys, color=color, lw=11.0, alpha=0.125)

        # Shadow offset for tube depth
        shadow_x = xs + 0.004 * dir_sign
        shadow_y = ys - 0.0015
        ax.plot(shadow_x, shadow_y, color="#020617", lw=6.6, alpha=0.32)

        # Main tube core
        ax.plot(xs, ys, color=color, lw=5.5, alpha=0.96)

        # Specular highlight line to mimic glossy/glass surface
        highlight_shift = (0.0025 + 0.0015 * depth_arr) * (-dir_sign)
        ax.plot(xs + highlight_shift, ys + 0.0012, color="#f8fafc", lw=1.3, alpha=0.36)

    draw_glass_strand(x1, y, left_color, depth, dir_sign=1.0)
    draw_glass_strand(x2, y, right_color, depth, dir_sign=-1.0)

    # Rungs and nodes.
    rung_idx = np.arange(0, len(y), 12)
    for idx in rung_idx:
        depth_w = float(0.5 + 0.5 * np.cos(freq * y[idx]))
        rung_alpha = 0.18 + 0.48 * depth_w
        rung_lw = 0.8 + 1.4 * depth_w
        ax.plot([x1[idx], x2[idx]], [y[idx], y[idx]], color="#a5b4fc", lw=rung_lw, alpha=rung_alpha)
        ax.plot([x1[idx], x2[idx]], [y[idx] + 0.0008, y[idx] + 0.0008], color="#f8fafc", lw=0.45, alpha=0.12 + 0.20 * depth_w)
        node_r = 0.004 + 0.003 * depth_w
        ax.add_patch(Circle((x1[idx], y[idx]), node_r, color="#22d3ee", alpha=0.95))
        ax.add_patch(Circle((x2[idx], y[idx]), node_r, color="#f43f5e" if not is_legit else "#4ade80", alpha=0.95))

    # Neon orbit rings to mimic the reference visual energy.
    orbit_y = np.linspace(0.18, 0.86, 5)
    for oy in orbit_y:
        t = np.linspace(0, 2 * np.pi, 240)
        rx = 0.17
        ry = 0.03
        ring_x = x_center + rx * np.cos(t)
        ring_y = oy + ry * np.sin(t)
        ax.plot(ring_x, ring_y, color="#22d3ee", lw=1.0, alpha=0.18)
        if not is_legit:
            ax.plot(ring_x * 0.998 + 0.001, ring_y, color="#fb7185", lw=0.8, alpha=0.2)

    # Sparse particles for cyber ambiance.
    seed = int.from_bytes(hashlib.sha256(sample.url.encode("utf-8")).digest()[:8], "big")
    rng = np.random.default_rng(seed)
    p_count = 140
    px = rng.uniform(0.1, 0.9, p_count)
    py = rng.uniform(0.06, 0.94, p_count)
    ps = rng.uniform(2.0, 9.0, p_count)
    p_alpha = rng.uniform(0.05, 0.28, p_count)
    p_col = "#38bdf8" if is_legit else "#fb7185"
    ax.scatter(px, py, s=ps, c=p_col, alpha=p_alpha, linewidths=0)

    # Side legends similar to reference.
    safe_items = [
        ("◉", "Normal / Legitimate", "#38bdf8"),
        ("●", "Verified / Safe", "#22c55e"),
        ("S", "Secure Connection", "#67e8f9"),
        ("L", "Encrypted Data", "#4ade80"),
        ("✔", "Trusted Source", "#22c55e"),
    ]
    threat_items = [
        ("⚠", "Phishing Attempt", "#ef4444"),
        ("☠", "Malicious Payload", "#fb7185"),
        ("⊗", "Anomalous Behavior", "#f87171"),
        ("!", "Threat Detected", "#ef4444"),
        ("▲", "High DGA Pattern" if dga_score >= 0.45 else "Low DGA Pattern", "#fca5a5"),
    ]

    y_left = [0.92, 0.86, 0.66, 0.56, 0.36]
    y_right = [0.80, 0.70, 0.58, 0.44, 0.34]

    for (glyph, txt, col), yl in zip(safe_items, y_left):
        ax.add_patch(Circle((0.07, yl), 0.012, color=col, alpha=0.95))
        ax.text(0.07, yl, glyph, color="#e2e8f0", fontsize=8.5, va="center", ha="center", weight="bold")
        ax.text(0.095, yl, txt, color="#d1fae5", fontsize=8.8, va="center", ha="left", weight="bold")

    for (glyph, txt, col), yr in zip(threat_items, y_right):
        ax.add_patch(Circle((0.93, yr), 0.012, color=col, alpha=0.96))
        ax.text(0.93, yr, glyph, color="#f8fafc", fontsize=8.5, va="center", ha="center", weight="bold")
        ax.text(0.905, yr, txt, color="#fecaca", fontsize=8.8, va="center", ha="right", weight="bold")

    # Embedded mini heatmap panel for interpretability.
    inset = ax.inset_axes([0.42, 0.03, 0.16, 0.15])
    heatmap_cmap = LinearSegmentedColormap.from_list(
        "poster_heat",
        ["#020617", "#0ea5e9", "#22c55e"] if is_legit else ["#020617", "#7e22ce", "#ef4444"],
    )
    inset.imshow(grid, cmap=heatmap_cmap, interpolation="nearest", vmin=0.0, vmax=1.0)
    inset.set_xticks([])
    inset.set_yticks([])
    inset.set_title("Visual DNA Grid", color="#e2e8f0", fontsize=7, pad=2)

    # Header block.
    ax.text(0.5, 0.98, "VISUAL DNA SECURITY MAP", color="#f8fafc", fontsize=13, ha="center", va="top", weight="bold")
    ax.text(
        0.5,
        0.955,
        f"{sample.label}  |  DGA likelihood: {dga_score:.2f}",
        color="#cbd5e1",
        fontsize=8.8,
        ha="center",
        va="top",
    )

    poster_path = OUTPUT_DIR / f"{sample.label}_reference_style.png"
    fig.savefig(poster_path, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close(fig)
    print(f"Saved poster: {poster_path}")


def save_visualizations(sample: UrlSample, grid: np.ndarray, dga_score: float) -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    x = np.arange(grid.shape[1])
    y = np.arange(grid.shape[0])
    xx, yy = np.meshgrid(x, y)

    is_legit = sample.category == "legitimate"
    status_text = "Verified / Safe" if is_legit else "Phishing / Anomalous"
    status_color = "#2efc7f" if is_legit else "#ff3b3b"
    accent_color = "#00d4ff" if is_legit else "#ff4d4d"

    heatmap_cmap = LinearSegmentedColormap.from_list(
        "dna_cyber",
        ["#020617", "#0ea5e9", "#22c55e"] if is_legit else ["#020617", "#7e22ce", "#ff3b3b"],
    )
    surface_cmap = LinearSegmentedColormap.from_list(
        "dna_surface",
        ["#0a0f25", "#00c2ff", "#4dff9a"] if is_legit else ["#12031f", "#8b1de8", "#ff5f5f"],
    )

    fig = plt.figure(figsize=(14, 6), dpi=220, facecolor="#030712")
    fig.subplots_adjust(left=0.04, right=0.98, top=0.88, bottom=0.08, wspace=0.16)

    # 2D heatmap for CNN-ready and interpretable view.
    ax1 = fig.add_subplot(1, 3, 1)
    ax1.set_facecolor("#030712")
    im = ax1.imshow(grid, cmap=heatmap_cmap, interpolation="nearest", vmin=0.0, vmax=1.0)
    ax1.set_title("2D Visual DNA Heatmap", color="#e2e8f0", fontsize=11, weight="bold")
    ax1.set_xlabel("Grid X", color="#94a3b8")
    ax1.set_ylabel("Grid Y", color="#94a3b8")
    ax1.tick_params(colors="#64748b", labelsize=7)
    cbar1 = fig.colorbar(im, ax=ax1, fraction=0.046, pad=0.03)
    cbar1.set_label("Normalized Intensity", color="#94a3b8", fontsize=8)
    cbar1.ax.yaxis.set_tick_params(color="#64748b")
    plt.setp(cbar1.ax.get_yticklabels(), color="#94a3b8", fontsize=7)

    # Smooth 3D surface from the same grid.
    ax2 = fig.add_subplot(1, 3, 2, projection="3d")
    ax2.set_facecolor("#030712")
    surface = ax2.plot_surface(
        xx,
        yy,
        grid,
        cmap=surface_cmap,
        linewidth=0,
        antialiased=True,
        rstride=1,
        cstride=1,
        alpha=0.98,
    )
    ax2.set_title("3D Visual DNA Surface", color="#e2e8f0", fontsize=11, weight="bold", pad=10)
    ax2.set_xlabel("X", color="#94a3b8", labelpad=4)
    ax2.set_ylabel("Y", color="#94a3b8", labelpad=4)
    ax2.set_zlabel("Intensity", color="#94a3b8", labelpad=4)
    ax2.tick_params(colors="#64748b", labelsize=7)
    ax2.view_init(elev=35, azim=225)
    cbar2 = fig.colorbar(surface, ax=ax2, fraction=0.046, pad=0.03)
    cbar2.set_label("Surface Height", color="#94a3b8", fontsize=8)
    cbar2.ax.yaxis.set_tick_params(color="#64748b")
    plt.setp(cbar2.ax.get_yticklabels(), color="#94a3b8", fontsize=7)

    # Right side status panel to mirror presentation-style narrative.
    ax3 = fig.add_subplot(1, 3, 3)
    ax3.set_facecolor("#030712")
    ax3.axis("off")
    panel_lines = [
        ("Status", status_text),
        ("Category", sample.category.replace("_", " ").title()),
        ("DGA Likelihood", f"{dga_score:.2f}"),
        ("Interpretation", "Clustered pattern" if is_legit else "Noisy/irregular pattern"),
        ("CNN Ready", "Yes (grayscale grid exported)"),
    ]

    ax3.text(
        0.02,
        0.95,
        "Visual DNA Security Panel",
        color="#e2e8f0",
        fontsize=12,
        weight="bold",
        va="top",
    )
    ax3.text(
        0.02,
        0.86,
        f"● {status_text}",
        color=status_color,
        fontsize=11,
        weight="bold",
        va="top",
    )

    y = 0.75
    for key, value in panel_lines:
        ax3.text(0.02, y, f"{key}:", color="#7dd3fc", fontsize=9, weight="bold", va="top")
        ax3.text(0.35, y, value, color="#cbd5e1", fontsize=9, va="top")
        y -= 0.11

    ax3.add_patch(
        plt.Rectangle((0.02, 0.06), 0.9, 0.11, fill=False, edgecolor=accent_color, linewidth=1.4, alpha=0.9)
    )
    ax3.text(
        0.04,
        0.115,
        "Academic note: Legitimate URLs should exhibit tighter "
        "feature clusters, while DGA phishing shows higher dispersion.",
        color="#e2e8f0",
        fontsize=8,
        va="center",
    )

    fig.suptitle(
        f"Visual DNA Analysis | {sample.label}",
        color="#f8fafc",
        fontsize=14,
        weight="bold",
    )

    figure_path = OUTPUT_DIR / f"{sample.label}_visual_dna.png"
    cnn_path = OUTPUT_DIR / f"{sample.label}_cnn_input.png"

    fig.savefig(figure_path, bbox_inches="tight")
    plt.close(fig)
    save_cnn_image(grid, cnn_path)
    save_reference_style_poster(sample, grid, dga_score)

    print(f"Saved figure: {figure_path}")
    print(f"Saved CNN grid: {cnn_path}")


def main() -> None:
    print("Generating Visual DNA heatmaps and 3D surfaces...")
    all_samples = LEGIT_URLS + PHISHING_DGA_URLS

    for sample in all_samples:
        grid, dga_score = build_visual_dna_grid(sample.url)
        save_visualizations(sample, grid, dga_score)

    print("Done. Presentation-ready outputs are in:")
    print(OUTPUT_DIR)


if __name__ == "__main__":
    main()
