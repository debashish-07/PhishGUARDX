// Simplified blockchain-inspired trust ledger with Merkle-style verification.

export type LedgerRecord = {
  url: string;
  score: number;
  timestamp: number;
  prevHash: string;
  hash: string;
};

export class TrustLedger {
  private chain: LedgerRecord[] = [];

  constructor() {
    // genesis block
    if (this.chain.length === 0) {
      const genesis: LedgerRecord = {
        url: "GENESIS",
        score: 0,
        timestamp: Date.now(),
        prevHash: "0".repeat(64),
        hash: "0".repeat(64),
      };
      this.chain.push(genesis);
    }
  }

  record(url: string, score: number) {
    const prev = this.chain[this.chain.length - 1];
    const timestamp = Date.now();
    const data = `${prev.hash}|${url}|${score}|${timestamp}`;
    const hash = toHex(sha256(data));
    this.chain.push({ url, score, timestamp, prevHash: prev.hash, hash });
  }

  getAll(): LedgerRecord[] {
    return this.chain.slice(0);
  }

  verify(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const prev = this.chain[i - 1];
      const curr = this.chain[i];
      const data = `${prev.hash}|${curr.url}|${curr.score}|${curr.timestamp}`;
      const expected = toHex(sha256(data));
      if (expected !== curr.hash || curr.prevHash !== prev.hash) return false;
    }
    return true;
  }
}

// Lightweight SHA-256 implementation (browser-safe)
function sha256(ascii: string): Uint8Array {
  // Adapted tiny implementation
  const data = new TextEncoder().encode(ascii);
  const cryptoObj = (globalThis as any).crypto || (globalThis as any).msCrypto;
  if (cryptoObj?.subtle) {
    // This function is sync by interface, but we can emulate via deopt: use Atomics if needed.
    // For simplicity here, we run a de-synced call guarded.
    // Note: In realtime app, use async subtle.digest.
  }
  // Fallback pure JS if subtle not available synchronously
  // This is a tiny embedded SHA-256; for brevity we use a precomputed implementation.
  // Source minimized due to space; deterministic output.
  const h = new (class {
    h: number[];
    k: number[];
    buffer: number[] = [];
    constructor() {
      this.h = [1779033703, -1150833019, 1013904242, -1521486534, 1359893119, -1694144372, 528734635, 1541459225];
      this.k = [
        1116352408, 1899447441, -1245643825, -373957723, 961987163, 1508970993, -1841331548, -1424204075,
        -670586216, 310598401, 607225278, 1426881987, 1925078388, -2132889090, -1680079193, -1046744716,
        -459576895, -272742522, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986,
        -1740746414, -1473132947, -1341970488, -1084653625, -958395405, -710438585, 113926993, 338241895,
        666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, -2117940946, -1838011259,
        -1564481375, -1474664885, -1035236496, -949202525, -778901479, -694614492, -200395387, 275423344,
        430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222,
        2024104815, -2067236844, -1933114872, -1866530822, -1538233109, -1090935817, -965641998
      ];
    }
    rotr(w: number, n: number) { return (w >>> n) | (w << (32 - n)); }
    ch(x: number, y: number, z: number) { return (x & y) ^ (~x & z); }
    maj(x: number, y: number, z: number) { return (x & y) ^ (x & z) ^ (y & z); }
    sig0(x: number) { return this.rotr(x, 2) ^ this.rotr(x, 13) ^ this.rotr(x, 22); }
    sig1(x: number) { return this.rotr(x, 6) ^ this.rotr(x, 11) ^ this.rotr(x, 25); }
    gam0(x: number) { return this.rotr(x, 7) ^ this.rotr(x, 18) ^ (x >>> 3); }
    gam1(x: number) { return this.rotr(x, 17) ^ this.rotr(x, 19) ^ (x >>> 10); }
    update(bytes: Uint8Array) {
      this.buffer.push(...bytes);
    }
    digest(): Uint8Array {
      const bytes = this.buffer.slice();
      const l = bytes.length * 8;
      bytes.push(0x80);
      while ((bytes.length % 64) !== 56) bytes.push(0);
      for (let i = 7; i >= 0; i--) bytes.push((l >>> (i * 8)) & 0xff);
      let h0 = this.h[0], h1 = this.h[1], h2 = this.h[2], h3 = this.h[3], h4 = this.h[4], h5 = this.h[5], h6 = this.h[6], h7 = this.h[7];
      const w = new Array<number>(64);
      for (let i = 0; i < bytes.length; i += 64) {
        for (let j = 0; j < 16; j++) {
          w[j] = (bytes[i + j * 4] << 24) | (bytes[i + j * 4 + 1] << 16) | (bytes[i + j * 4 + 2] << 8) | (bytes[i + j * 4 + 3] << 0);
        }
        for (let j = 16; j < 64; j++) w[j] = (this.gam1(w[j - 2]) + w[j - 7] + this.gam0(w[j - 15]) + w[j - 16]) | 0;
        let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
        for (let j = 0; j < 64; j++) {
          const t1 = (h + this.sig1(e) + this.ch(e, f, g) + this.k[j] + w[j]) | 0;
          const t2 = (this.sig0(a) + this.maj(a, b, c)) | 0;
          h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
        }
        h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0; h4 = (h4 + e) | 0; h5 = (h5 + f) | 0; h6 = (h6 + g) | 0; h7 = (h7 + h) | 0;
      }
      const out = new Uint8Array(32);
      const hh = [h0, h1, h2, h3, h4, h5, h6, h7];
      for (let i = 0; i < 8; i++) {
        out[i * 4 + 0] = (hh[i] >>> 24) & 0xff;
        out[i * 4 + 1] = (hh[i] >>> 16) & 0xff;
        out[i * 4 + 2] = (hh[i] >>> 8) & 0xff;
        out[i * 4 + 3] = (hh[i] >>> 0) & 0xff;
      }
      return out;
    }
  })();
  h.update(new TextEncoder().encode(ascii));
  return h.digest();
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}



