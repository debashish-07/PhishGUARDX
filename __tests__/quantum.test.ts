import { computeQuantumHash } from "@/lib/quantum";

describe("quantum hashing", () => {
  it("returns normalized vector of given dims", () => {
    const vec = computeQuantumHash("hello", 32);
    expect(vec).toHaveLength(32);
    const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
    expect(Math.abs(norm - 1)).toBeLessThan(1e-5);
  });
});



