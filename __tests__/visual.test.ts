import { renderVisualFingerprint } from "@/lib/visual";

describe("visual dna", () => {
  it("renders on canvas without throwing", () => {
    document.body.innerHTML = '<canvas id="c" width="200" height="100"></canvas>';
    const canvas = document.getElementById("c") as HTMLCanvasElement;
    expect(() => renderVisualFingerprint("hello", canvas)).not.toThrow();
  });
});



