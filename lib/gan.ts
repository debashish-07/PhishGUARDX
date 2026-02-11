// Benign adversarial GAN-like URL mutations to harden detector (no network)

export function benignMutations(url: string, n: number = 8): string[] {
  const out = new Set<string>();
  for (let i = 0; i < n * 3 && out.size < n; i++) {
    let u = url;
    const op = i % 4;
    if (op === 0) u = u.replace(/\./g, (m, idx) => (idx % 2 ? "-" : "."));
    else if (op === 1) u = u.replace(/\//g, (m, idx) => (idx % 2 ? "//" : "/"));
    else if (op === 2) u = u + (u.includes("?") ? "&ref=mail" : "?ref=mail");
    else u = u.replace(/[aeiou]/gi, (c) => (c === c.toLowerCase() ? "@" : c));
    out.add(u);
  }
  return Array.from(out);
}


