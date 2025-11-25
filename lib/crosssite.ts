// Cross-site behavior analyzer (static URL-level simulation)

export type CrossSiteReport = {
  potentialRedirects: string[];
  suspiciousJS: boolean;
  formHijackRisk: boolean;
};

export function analyzeCrossSite(url: string): CrossSiteReport {
  // We cannot fetch or execute external JS here; simulate from patterns
  const potentialRedirects = [] as string[];
  if (/url=|redirect|r=/i.test(url)) potentialRedirects.push("query-redirect");
  if (/base64,/i.test(url)) potentialRedirects.push("data-base64");

  const suspiciousJS = /(javascript:|onload=|onerror=)/i.test(url);
  const formHijackRisk = /(password|otp|token)/i.test(url) && /submit|action=/i.test(url);

  return { potentialRedirects, suspiciousJS, formHijackRisk };
}


