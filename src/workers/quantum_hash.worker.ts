const quantumCtx: Worker = self as any;

// Simple seeded random number generator
function seededRandomQuantum(seed: number) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

quantumCtx.onmessage = (event: MessageEvent) => {
    const { url } = event.data;

    // Create a deterministic seed from the URL
    let seed = 0;
    for (let i = 0; i < url.length; i++) {
        seed = ((seed << 5) - seed) + url.charCodeAt(i);
        seed |= 0; // Convert to 32bit integer
    }

    // Generate deterministic "quantum" features
    const features = [];
    for (let i = 0; i < 64; i++) {
        features.push(seededRandomQuantum(seed + i));
    }

    quantumCtx.postMessage(features);
};
