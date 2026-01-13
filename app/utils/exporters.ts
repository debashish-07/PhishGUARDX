import { LedgerEntry } from './trustLedger';

export function exportToCSV(entries: LedgerEntry[], filename: string = 'ledger-export.csv'): void {
  const headers = ['Timestamp', 'URL', 'Risk Score', 'Verdict', 'Heuristic', 'Quantum', 'Visual', 'Transformer', 'Ensemble', 'Prev Hash', 'Curr Hash'];
  const rows = entries.map(e => [
    new Date(e.timestamp).toISOString(),
    `"${e.url}"`,
    e.riskScore.toFixed(2),
    e.verdict,
    e.moduleScores.heuristic.toFixed(2),
    e.moduleScores.quantum.toFixed(2),
    e.moduleScores.visual.toFixed(2),
    e.moduleScores.transformer.toFixed(2),
    e.moduleScores.ensemble.toFixed(2),
    e.previousHash.substring(0, 16),
    e.currentHash.substring(0, 16),
  ]);

  const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToJSON(entries: LedgerEntry[], filename: string = 'ledger-export.json'): void {
  const data = {
    exportDate: new Date().toISOString(),
    totalEntries: entries.length,
    entries: entries.map(e => ({
      timestamp: new Date(e.timestamp).toISOString(),
      url: e.url,
      riskScore: e.riskScore,
      verdict: e.verdict,
      moduleScores: e.moduleScores,
      hashes: {
        previous: e.previousHash.substring(0, 32),
        current: e.currentHash.substring(0, 32),
      },
    })),
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToMarkdown(entries: LedgerEntry[], filename: string = 'ledger-export.md'): void {
  let md = `# Phishing Detector Ledger Export\n\n`;
  md += `**Export Date:** ${new Date().toISOString()}\n`;
  md += `**Total Entries:** ${entries.length}\n\n`;
  md += `---\n\n`;

  entries.forEach((entry, idx) => {
    md += `## Entry ${idx + 1}: ${entry.verdict.toUpperCase()}\n\n`;
    md += `- **URL:** ${entry.url}\n`;
    md += `- **Risk Score:** ${entry.riskScore.toFixed(2)}%\n`;
    md += `- **Timestamp:** ${new Date(entry.timestamp).toLocaleString()}\n`;
    md += `- **Module Scores:**\n`;
    md += `  - Heuristic: ${entry.moduleScores.heuristic.toFixed(2)}%\n`;
    md += `  - Quantum: ${entry.moduleScores.quantum.toFixed(2)}%\n`;
    md += `  - Visual: ${entry.moduleScores.visual.toFixed(2)}%\n`;
    md += `  - Transformer: ${entry.moduleScores.transformer.toFixed(2)}%\n`;
    md += `  - Ensemble: ${entry.moduleScores.ensemble.toFixed(2)}%\n`;
    md += `- **Hashes:**\n`;
    md += `  - Previous: \`${entry.previousHash.substring(0, 32)}...\`\n`;
    md += `  - Current: \`${entry.currentHash.substring(0, 32)}...\`\n\n`;
    md += `---\n\n`;
  });

  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
