// Placeholder for GNN-based URL structure analysis (optional ONNX model)

export type GraphEdge = { from: number; to: number };

export function urlToGraph(url: string): { nodes: string[]; edges: GraphEdge[] } {
  const parts = url.split(/[:/?#.&=-]+/).filter(Boolean);
  const nodes = Array.from(new Set(parts));
  const edges: GraphEdge[] = [];
  for (let i = 0; i < parts.length - 1; i++) {
    const a = nodes.indexOf(parts[i]);
    const b = nodes.indexOf(parts[i + 1]);
    if (a !== -1 && b !== -1) edges.push({ from: a, to: b });
  }
  return { nodes, edges };
}


