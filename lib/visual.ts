// Canvas-based visual DNA fingerprinting. Deterministic pattern from input.

export function renderVisualFingerprint(input: string, canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);

  const seed = hash(input);
  let x = (seed % width) | 0;
  let y = ((seed >>> 8) % height) | 0;
  let hue = (seed % 360) | 0;

  for (let i = 0; i < 200; i++) {
    hue = (hue + (seed % 17)) % 360;
    ctx.fillStyle = `hsl(${hue},70%,${40 + ((seed >>> (i % 16)) % 40)}%)`;
    const w = 8 + ((seed >>> (i % 24)) % 32);
    const h = 8 + ((seed >>> (i % 20)) % 24);
    x = (x + ((seed >>> (i % 5)) % 31) - 15 + width) % width;
    y = (y + ((seed >>> (i % 7)) % 31) - 15 + height) % height;
    ctx.fillRect(x, y, w, h);
  }

  // Center overlay grid derived from characters
  const cell = 16;
  for (let i = 0; i < input.length && i < 64; i++) {
    const v = input.charCodeAt(i);
    const cx = (i % 8) * cell + (width - 8 * cell) / 2;
    const cy = Math.floor(i / 8) * cell + (height - 8 * cell) / 2;
    ctx.fillStyle = `rgba(${v % 255}, ${(v * 3) % 255}, ${(v * 7) % 255}, 0.6)`;
    ctx.fillRect(cx, cy, cell - 2, cell - 2);
  }
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 131 + s.charCodeAt(i)) >>> 0;
  return h >>> 0;
}



