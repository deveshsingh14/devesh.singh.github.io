export const escapeHtml = (str) => {
    if (typeof str !== 'string') return str;
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

export function throttle(callback) {
    let isWaiting = false;
    return function(...args) {
        if (!isWaiting) {
            isWaiting = true;
            window.requestAnimationFrame(() => {
                callback.apply(this, args);
                isWaiting = false;
            });
        }
    };
}

export const typeLines = (lines, container, onDone) => {
    let i = 0;
    const next = () => {
        if (i >= lines.length) { if (onDone) onDone(); return; }
        const { html, delay } = lines[i];
        const div = document.createElement('div');
        div.innerHTML = html;
        div.style.opacity = '0';
        div.style.transform = 'translateY(4px)';
        div.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        container.appendChild(div);
        requestAnimationFrame(() => { div.style.opacity = '1'; div.style.transform = 'translateY(0)'; });
        container.scrollTop = container.scrollHeight;
        i++;
        setTimeout(next, delay);
    };
    next();
};

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
