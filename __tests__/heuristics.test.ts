import { evaluateUrlHeuristics } from "@/lib/heuristics";

describe("heuristics", () => {
  it("flags ip URLs and suspicious tokens", () => {
    const res = evaluateUrlHeuristics("http://192.168.1.5/login/verify");
    expect(res.score).toBeGreaterThan(10);
    expect(Object.keys(res.signals).length).toBeGreaterThan(0);
  });

  it("low risk for simple https domain", () => {
    const res = evaluateUrlHeuristics("https://example.com");
    expect(res.score).toBeLessThan(20);
  });
});



