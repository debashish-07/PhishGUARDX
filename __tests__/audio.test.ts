import { generateAudioFeatures } from "@/lib/audio";

describe("audio features", () => {
  it("produces spectrum and energy", async () => {
    const feat = await generateAudioFeatures("https://example.com/login");
    expect(feat.spectrum.length).toBeGreaterThan(0);
    expect(feat.energy).toBeGreaterThanOrEqual(0);
  });
});



