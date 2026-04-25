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

/**
 * Calculate confidence level based on module agreement
 */
export function calculateConfidence(moduleScores: {
  heuristic: number;
  quantum: number;
  visual: number;
  transformer: number;
  ensemble: number;
}): { level: 'high' | 'medium' | 'low'; score: number; reason: string } {
  const scores = Object.values(moduleScores);
  const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  
  // Calculate variance
  const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);
  
  // Calculate agreement (coefficient of variation)
  const coefficientOfVariation = (stdDev / mean) || 0;
  
  // Determine confidence level
  if (coefficientOfVariation < 0.15) {
    return {
      level: 'high',
      score: 95,
      reason: 'All detection modules show strong agreement on risk assessment.',
    };
  } else if (coefficientOfVariation < 0.35) {
    return {
      level: 'medium',
      score: 75,
      reason: 'Detection modules show moderate agreement with some variance.',
    };
  } else {
    return {
      level: 'low',
      score: 50,
      reason: 'Detection modules show significant disagreement; borderline case.',
    };
  }
}

/**
 * Generate human-readable verbalized conclusion
 */
export function generateVerbalizedConclusion(
  riskScore: number,
  moduleScores: {
    heuristic: number;
    quantum: number;
    visual: number;
    transformer: number;
    ensemble: number;
  },
  url: string
): { conclusion: string; recommendation: string } {
  // Find dominant module(s)
  const sorted = Object.entries(moduleScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2);
  
  const primary = sorted[0];
  const secondary = sorted[1];
  
  // Determine primary factors
  let primaryFactor = '';
  if (primary[0] === 'heuristic') {
    primaryFactor = 'suspicious keyword patterns and structural anomalies';
  } else if (primary[0] === 'transformer') {
    primaryFactor = 'semantic analysis indicating deceptive content';
  } else if (primary[0] === 'quantum') {
    primaryFactor = 'abnormal URL structure detected by quantum fingerprinting';
  } else if (primary[0] === 'visual') {
    primaryFactor = 'visual DNA fingerprinting showing similarity to known threats';
  } else if (primary[0] === 'ensemble') {
    primaryFactor = 'machine learning model consensus';
  }
  
  let secondaryFactor = '';
  if (secondary && secondary[1] > 40) {
    if (secondary[0] === 'heuristic') {
      secondaryFactor = 'rule-based pattern matching';
    } else if (secondary[0] === 'transformer') {
      secondaryFactor = 'natural language processing';
    } else if (secondary[0] === 'quantum') {
      secondaryFactor = 'structural fingerprinting';
    } else if (secondary[0] === 'visual') {
      secondaryFactor = 'visual similarity analysis';
    } else if (secondary[0] === 'ensemble') {
      secondaryFactor = 'ML ensemble verification';
    }
  }
  
  // Construct conclusion and recommendation
  let conclusion = '';
  let recommendation = '';
  
  if (riskScore >= 70) {
    conclusion = `The main reason for this HIGH RISK classification is ${primaryFactor}${secondaryFactor ? ` combined with ${secondaryFactor}` : ''}.`;
    recommendation = '🛑 Recommendation: Do not interact with this URL. Block or report if possible.';
  } else if (riskScore >= 40) {
    conclusion = `This URL shows SUSPICIOUS patterns, primarily due to ${primaryFactor}${secondaryFactor ? ` and ${secondaryFactor}` : ''}. Exercise caution.`;
    recommendation = '⚠️ Recommendation: Proceed with caution. Verify the source independently before sharing sensitive information.';
  } else {
    conclusion = `This URL appears SAFE. Analysis shows low threat indicators across all detection methods.`;
    recommendation = '✅ Recommendation: This URL appears legitimate based on current analysis.';
  }
  
  return { conclusion, recommendation };
}


