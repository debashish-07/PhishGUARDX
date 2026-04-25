const visualCtx: Worker = self as any;

function seededRandomVisual(seed: number) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

visualCtx.onmessage = (event: MessageEvent) => {
    const { url } = event.data;

    let seed = 0;
    for (let i = 0; i < url.length; i++) {
        seed = ((seed << 5) - seed) + url.charCodeAt(i);
        seed |= 0;
    }

    // Generate 10x10 grid
    const grid = [];
    for (let i = 0; i < 10; i++) {
        const row = [];
        for (let j = 0; j < 10; j++) {
            row.push(seededRandomVisual(seed + i * 10 + j));
        }
        grid.push(row);
    }

    visualCtx.postMessage(grid);
};
