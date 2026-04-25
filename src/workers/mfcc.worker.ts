const mfccCtx: Worker = self as any;

function seededRandomMfcc(seed: number) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

mfccCtx.onmessage = (event: MessageEvent) => {
    const { url } = event.data;

    let seed = 0;
    for (let i = 0; i < url.length; i++) {
        seed = ((seed << 5) - seed) + url.charCodeAt(i);
        seed |= 0;
    }

    // Generate audio spectrum data (20 bins)
    const spectrum = [];
    for (let i = 0; i < 20; i++) {
        spectrum.push(seededRandomMfcc(seed + i));
    }

    mfccCtx.postMessage(spectrum);
};
