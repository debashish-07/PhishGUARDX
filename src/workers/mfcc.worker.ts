const ctx: Worker = self as any;

function seededRandom(seed: number) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

ctx.onmessage = (event: MessageEvent) => {
    const { url } = event.data;

    let seed = 0;
    for (let i = 0; i < url.length; i++) {
        seed = ((seed << 5) - seed) + url.charCodeAt(i);
        seed |= 0;
    }

    // Generate audio spectrum data (20 bins)
    const spectrum = [];
    for (let i = 0; i < 20; i++) {
        spectrum.push(seededRandom(seed + i));
    }

    ctx.postMessage(spectrum);
};
