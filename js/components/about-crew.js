// About cursor crew: when About scrolls into view it starts as a blueprint and a
// crew of cursors builds it live. Afterwards the crew mirrors the visitor's cursor
// inside About and merges back into it on the way out. Phones get the build only;
// reduced-motion visitors get the finished section.

const ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 2 L3 19.5 L7.6 15.3 L10.9 22.2 L14 20.8 L10.8 14 L17 14 Z"/></svg>';
const NAMES = ['type', 'copy', 'copy', 'style', 'draw', 'qa'];
const TAGS = ['<p> origin', '<p> today', '<p> beyond code'];

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function initAboutCrew() {
    const about = document.getElementById('about');
    if (!about || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const title = about.querySelector('.section-title');
    const textBlock = about.querySelector('.text-block');
    const art = about.querySelector('.about-illustration');
    if (!title || !textBlock || !art) return;

    const fine = window.matchMedia('(pointer: fine)').matches;
    const titleText = title.textContent.trim();
    const links = [...about.querySelectorAll('.highlight-link')];
    const parts = [...art.querySelectorAll('.crew-part')];

    let layer, stamp, crew, me, titleSpan, blocks;
    let mode = 'idle';
    let built = false;
    const ptr = { x: 0, y: 0, cx: -1, cy: -1, inside: false };

    function setup() {
        about.classList.add('crew-on');
        titleSpan = document.createElement('span');
        titleSpan.className = 'crew-title';
        title.textContent = '';
        title.appendChild(titleSpan);

        blocks = [...textBlock.querySelectorAll(':scope > p')].map((p, i) => {
            const wrap = document.createElement('div');
            wrap.className = 'crew-blk';
            wrap.dataset.tag = TAGS[i] || '<p>';
            p.replaceWith(wrap);
            wrap.appendChild(p);
            return wrap;
        });
        art.dataset.tag = '<svg> desk';
        art.classList.add('crew-art');

        layer = document.createElement('div');
        layer.className = 'crew-layer';
        layer.setAttribute('aria-hidden', 'true');
        stamp = document.createElement('div');
        stamp.className = 'crew-stamp';
        stamp.setAttribute('aria-hidden', 'true');
        about.append(stamp, layer);

        const make = (name) => {
            const el = document.createElement('div');
            el.className = 'crew-ptr';
            el.innerHTML = ARROW + (name ? `<span class="crew-name">${name}</span>` : '');
            el.style.opacity = '0';
            layer.appendChild(el);
            return { el, x: 0, y: 0, tw: null };
        };
        crew = NAMES.map(make);
        me = make(null);
        me.el.classList.add('plain');
        about.classList.add('crew-pending');
    }

    const rel = (el, fx = 0.5, fy = 0.5) => {
        const a = about.getBoundingClientRect();
        const r = el.getBoundingClientRect();
        return { x: r.left - a.left + r.width * fx, y: r.top - a.top + r.height * fy, w: r.width, h: r.height };
    };
    const place = (c) => { c.el.style.transform = `translate(${c.x - 3}px, ${c.y - 2}px)`; };
    const go = (c, x, y, ms = 700) => new Promise((resolve) => {
        c.tw = { fx: c.x, fy: c.y, x, y, t0: performance.now(), ms, resolve };
    });
    const mark = (cls, x, y, text = '') => {
        const el = document.createElement('div');
        el.className = cls;
        el.textContent = text;
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        layer.appendChild(el);
        setTimeout(() => el.remove(), 1250);
    };

    async function wipe(c, blk, ms) {
        const p = blk.querySelector('p');
        const r = rel(blk, 0, 0.5);
        await go(c, r.x, r.y, 600);
        mark('crew-ripple', r.x, r.y);
        const start = performance.now();
        await new Promise((resolve) => {
            const step = (now) => {
                const k = Math.min(1, (now - start) / ms);
                p.style.setProperty('--crew-r', `${k * 100}%`);
                c.x = r.x + r.w * k;
                c.y = r.y + Math.sin(k * 18) * r.h * 0.35;
                place(c);
                if (k < 1) requestAnimationFrame(step); else resolve();
            };
            requestAnimationFrame(step);
        });
        blk.classList.add('done');
    }

    async function typeTitle(c) {
        const r = rel(title, 0, 0.5);
        await go(c, r.x + 4, r.y + 10, 650);
        for (const ch of titleText) {
            titleSpan.textContent += ch;
            c.x = r.x + titleSpan.getBoundingClientRect().width + 6;
            place(c);
            await sleep(110);
        }
        titleSpan.classList.add('done');
    }

    async function build() {
        mode = 'build';
        const t0 = performance.now();
        const a = about.getBoundingClientRect();
        const sx = ptr.inside ? ptr.x : a.width / 2;
        const sy = ptr.inside ? ptr.y : 60;
        crew.forEach((c, i) => {
            c.x = sx; c.y = sy; place(c);
            c.el.style.opacity = '1';
            const ang = (i / crew.length) * Math.PI * 2;
            go(c, sx + Math.cos(ang) * 70, sy + Math.abs(Math.sin(ang)) * 50 + 10, 380);
        });
        await sleep(400);

        const firstDone = (async () => { await sleep(150); await wipe(crew[1], blocks[0], 1500); })();
        await Promise.all([
            typeTitle(crew[0]).then(async () => { if (blocks[2]) { await sleep(200); await wipe(crew[0], blocks[2], 1200); } }),
            firstDone,
            (async () => { if (blocks[1]) { await sleep(500); await wipe(crew[2], blocks[1], 1400); } })(),
            (async () => {
                await firstDone;
                for (const link of links) {
                    const r = rel(link);
                    await go(crew[3], r.x, r.y, 500);
                    mark('crew-ripple', r.x, r.y);
                    link.classList.add('crew-lit');
                    await sleep(150);
                }
            })(),
            (async () => {
                for (const part of parts) {
                    const r = rel(part);
                    await go(crew[4], r.x, r.y, 420);
                    part.classList.add('on');
                    mark('crew-ripple', r.x, r.y);
                    await sleep(120);
                }
                art.classList.add('done');
            })(),
        ]);

        for (const el of [title, ...blocks, art]) {
            const r = rel(el, 0.97, 0.2);
            await go(crew[5], r.x, r.y, 380);
            mark('crew-tick', r.x - 4, r.y - 10, '✓');
        }
        about.classList.remove('crew-pending');
        about.classList.add('crew-built');
        stamp.textContent = `build passed · ${((performance.now() - t0) / 1000).toFixed(1)}s · 0 errors`;
        stamp.classList.add('on');
        await sleep(900);

        built = true;
        crew.forEach((c) => c.el.classList.add('plain'));
        if (fine && ptr.inside) enterPlay(); else merge();
    }

    function enterPlay() {
        mode = 'play';
        about.classList.add('crew-playing');
        me.x = ptr.x; me.y = ptr.y; place(me);
        me.el.style.opacity = '1';
        crew.forEach((c) => {
            if (c.el.style.opacity === '0') { c.x = ptr.x; c.y = ptr.y; }
            c.el.style.opacity = '1';
            c.tw = null;
        });
    }

    function merge() {
        mode = 'merge';
        about.classList.remove('crew-playing');
        me.el.style.opacity = '0';
        const tx = Math.max(0, Math.min(ptr.x, about.clientWidth));
        const ty = Math.max(0, Math.min(ptr.y, about.clientHeight));
        crew.forEach((c) => {
            go(c, tx, ty, 320).then(() => { if (mode === 'merge') c.el.style.opacity = '0'; });
        });
    }

    // Kaleidoscope mirror around the section centre; every few seconds the
    // clones collapse onto the real cursor and scatter again.
    let swapUntil = 0;
    let nextSwap = 0;
    function mirrorTarget(i, t) {
        if (t < swapUntil) return { x: ptr.x, y: ptr.y, k: 0.18 };
        const cx = about.clientWidth / 2;
        const cy = about.clientHeight / 2;
        const ang = ((i + 1) / (crew.length + 1)) * Math.PI * 2;
        const flip = i % 2 ? -1 : 1;
        const dx = ptr.x - cx;
        const dy = ptr.y - cy;
        return {
            x: cx + Math.cos(ang) * dx - Math.sin(ang) * dy * flip,
            y: cy + Math.sin(ang) * dx + Math.cos(ang) * dy * flip,
            k: 0.5,
        };
    }

    let running = false;
    function frame(t) {
        for (const c of [...crew, me]) {
            if (!c.tw) continue;
            const k = Math.min(1, (t - c.tw.t0) / c.tw.ms);
            const e = ease(k);
            c.x = c.tw.fx + (c.tw.x - c.tw.fx) * e;
            c.y = c.tw.fy + (c.tw.y - c.tw.fy) * e;
            if (k >= 1) { const done = c.tw.resolve; c.tw = null; done(); }
            place(c);
        }
        if (mode === 'play') {
            if (t > nextSwap) {
                if (nextSwap) swapUntil = t + 700;
                nextSwap = t + 7000 + Math.random() * 3000;
            }
            crew.forEach((c, i) => {
                if (c.tw) return;
                const g = mirrorTarget(i, t);
                c.x += (g.x - c.x) * g.k;
                c.y += (g.y - c.y) * g.k;
                place(c);
            });
            me.x = ptr.x; me.y = ptr.y; place(me);
        }
        if (mode === 'idle' || (mode === 'merge' && crew.every((c) => !c.tw))) { running = false; return; }
        requestAnimationFrame(frame);
    }
    const wake = () => { if (!running) { running = true; requestAnimationFrame(frame); } };

    function updateInside() {
        const a = about.getBoundingClientRect();
        ptr.x = ptr.cx - a.left;
        ptr.y = ptr.cy - a.top;
        const inside = ptr.cx >= 0 && ptr.cx >= a.left && ptr.cx <= a.right && ptr.cy >= a.top && ptr.cy <= a.bottom;
        if (inside === ptr.inside) return;
        ptr.inside = inside;
        if (!built || !fine) return;
        if (inside) enterPlay(); else merge();
        wake();
    }

    window.addEventListener('pointermove', (e) => {
        if (e.pointerType !== 'mouse') return;
        ptr.cx = e.clientX;
        ptr.cy = e.clientY;
        updateInside();
    }, { passive: true });
    window.addEventListener('scroll', () => { if (ptr.cx >= 0) updateInside(); }, { passive: true });
    document.addEventListener('mouseleave', () => { ptr.cx = -1; updateInside(); });

    const observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        setup();
        wake();
        build().catch(() => {
            about.classList.remove('crew-pending', 'crew-playing');
            about.classList.add('crew-built');
            title.textContent = titleText;
            layer.remove();
        });
    }, { threshold: 0.35 });
    observer.observe(about);
}

document.addEventListener('DOMContentLoaded', initAboutCrew);
