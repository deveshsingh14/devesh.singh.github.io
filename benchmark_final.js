import { performance } from 'perf_hooks';

const particles = Array.from({length: 100}, () => ({
    x: Math.random() * 800,
    y: Math.random() * 600
}));
const len = particles.length;

let mouseX = 400;
let mouseY = 300;
const CONNECT_RADIUS = 200;

const ctx = {
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    stroke: () => {}
};

let start = performance.now();
let resultString = '';
for (let frame = 0; frame < 5000; frame++) {
    for (let i = 0; i < len; i++) {
        const pix = particles[i].x;
        const piy = particles[i].y;

        const mdx = pix - mouseX;
        const mdy = piy - mouseY;
        const mDistSq = mdx * mdx + mdy * mdy;
        if (mDistSq < CONNECT_RADIUS * CONNECT_RADIUS) {
            const mDist = Math.sqrt(mDistSq);
            resultString = `rgba(255, 87, 49, ${0.65 - mDist / 320})`;
        }

        for (let j = i + 1; j < len; j++) {
            const pj = particles[j];
            const dx = pix - pj.x;
            const dy = piy - pj.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < 22500) {
                const dist = Math.sqrt(distSq);
                resultString = `rgba(255, 87, 49, ${0.4 - dist / 375})`;
            }
        }
    }
}
let tOriginal = performance.now() - start;
console.log(`Original Code: ${tOriginal.toFixed(2)} ms`);

start = performance.now();
for (let frame = 0; frame < 5000; frame++) {
    for (let i = 0; i < len; i++) {
        const pix = particles[i].x;
        const piy = particles[i].y;

        const mdx = pix - mouseX;
        const mdy = piy - mouseY;
        const mDistSq = mdx * mdx + mdy * mdy;
        if (mDistSq < 40000) {
            const absX = mdx < 0 ? -mdx : mdx;
            const absY = mdy < 0 ? -mdy : mdy;
            const mDist = absX > absY ? absX + 0.428 * absY : absY + 0.428 * absX;
            ctx.globalAlpha = Math.max(0, 0.65 - mDist / 320);
        }

        for (let j = i + 1; j < len; j++) {
            const pj = particles[j];
            const dx = pix - pj.x;
            const dy = piy - pj.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < 22500) {
                const absX = dx < 0 ? -dx : dx;
                const absY = dy < 0 ? -dy : dy;
                const dist = absX > absY ? absX + 0.428 * absY : absY + 0.428 * absX;
                ctx.globalAlpha = Math.max(0, 0.4 - dist / 375);
            }
        }
    }
}
let tOptimized = performance.now() - start;
console.log(`Optimized Code: ${tOptimized.toFixed(2)} ms`);
console.log(`Speedup: ${(tOriginal / tOptimized).toFixed(2)}x`);
