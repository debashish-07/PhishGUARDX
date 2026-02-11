export type HeuristicResult = {
  score: number; // 0-100 risk
  signals: Record<string, number>;
  reasons: string[];
};

const suspiciousTokens = [
  "login", "verify", "update", "secure", "account", "bank", "paypal",
  "unlock", "confirm", "invoice", "payment", "gift", "free", "urgent",
];

const tldsHighRisk = ["zip", "mov", "xyz", "top", "gq", "tk"];

const ipUrlRegex = /https?:\/\/(\d{1,3}\.){3}\d{1,3}/i;
const atSymbolRegex = /@/;
const excessiveSubdomainsRegex = /([a-z0-9-]+\.){3,}[a-z]{2,}/i;
const hexObfuscationRegex = /%[0-9a-fA-F]{2}/g;

export function evaluateUrlHeuristics(url: string): HeuristicResult {
  let risk = 0;
  const signals: Record<string, number> = {};
  const reasons: string[] = [];

  const lower = url.toLowerCase();
  const add = (name: string, points: number, reason: string) => {
    risk += points;
    signals[name] = (signals[name] ?? 0) + points;
    reasons.push(reason);
  };

  if (!/^https?:\/\//i.test(url)) add("no_scheme", 8, "URL missing http/https scheme");
  if (ipUrlRegex.test(url)) add("ip_in_host", 18, "URL uses raw IP address");
  if (atSymbolRegex.test(url)) add("at_symbol", 10, "URL contains @ which may hide real host");
  if (excessiveSubdomainsRegex.test(url)) add("many_subdomains", 10, "Excessive subdomains");
  if (hexObfuscationRegex.test(url)) add("hex_encoding", 8, "URL has percent-encoded obfuscation");

  for (const token of suspiciousTokens) {
    if (lower.includes(token)) add(`token_${token}`, 3, `Contains suspicious token: ${token}`);
  }

  const tldMatch = lower.match(/\.([a-z0-9]{2,})(?:\/?|$)/);
  if (tldMatch && tldsHighRisk.includes(tldMatch[1])) add("high_risk_tld", 10, `High-risk TLD: ${tldMatch[1]}`);

  const longUrl = url.length > 120;
  if (longUrl) add("long_url", 6, "Unusually long URL");

  const numDigits = (url.match(/\d/g) || []).length;
  if (numDigits > 12) add("many_digits", 6, "Many digits in URL");

  const numSpecial = (url.match(/[!$^*()+={}|\\[\]<>]/g) || []).length;
  if (numSpecial > 6) add("many_special", 6, "Many special characters");

  // Normalize risk to 0-100
  risk = Math.max(0, Math.min(100, Math.round(risk)));
  return { score: risk, signals, reasons };
}



