// SHAP/LIME-style simple explanation by token attribution

export type Attribution = { token: string; importance: number }[];

export function explainBySubstring(url: string, riskyTokens: string[]): Attribution {
  const lower = url.toLowerCase();
  const atts: { [k: string]: number } = {};
  for (const tok of riskyTokens) {
    let idx = -1;
    while ((idx = lower.indexOf(tok, idx + 1)) !== -1) {
      atts[tok] = (atts[tok] ?? 0) + 1;
    }
  }
  const max = Math.max(1, ...Object.values(atts));
  return Object.entries(atts)
    .map(([token, count]) => ({ token, importance: count / max }))
    .sort((a, b) => b.importance - a.importance);
}

export function heatmapRanges(url: string, tokens: string[]): { start: number; end: number; weight: number }[] {
  const lower = url.toLowerCase();
  const ranges: { start: number; end: number; weight: number }[] = [];
  for (const t of tokens) {
    let idx = -1;
    while ((idx = lower.indexOf(t, idx + 1)) !== -1) {
      ranges.push({ start: idx, end: idx + t.length, weight: 1 });
    }
  }
  return ranges;
}


