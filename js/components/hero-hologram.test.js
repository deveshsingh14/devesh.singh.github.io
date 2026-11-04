import { jest } from '@jest/globals';
import { initHeroHologram } from './hero-hologram.js';

describe('hero hologram', () => {
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    const OriginalObserver = window.IntersectionObserver;

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="hero-hologram">
                <div class="hero-hologram-fallback" hidden><img src="assets/nav-logo.png" alt=""></div>
            </div>
        `;
    });

    afterEach(() => {
        HTMLCanvasElement.prototype.getContext = originalGetContext;
        window.IntersectionObserver = OriginalObserver;
    });

    test('does nothing when the mount is missing', () => {
        document.body.innerHTML = '';
        expect(() => initHeroHologram()).not.toThrow();
    });

    test('shows the flat logo when WebGL is unavailable', () => {
        HTMLCanvasElement.prototype.getContext = () => null;
        initHeroHologram();
        expect(document.querySelector('.hero-hologram-fallback').hidden).toBe(false);
    });

    test('waits for the hero to be visible before loading the 3D scene', () => {
        const observe = jest.fn();
        window.IntersectionObserver = class {
            constructor() {}
            observe(el) { observe(el); }
            disconnect() {}
        };
        initHeroHologram();
        expect(observe).toHaveBeenCalledWith(document.getElementById('hero-hologram'));
        expect(document.querySelector('.hero-hologram-fallback').hidden).toBe(true);
        expect(document.querySelector('#hero-hologram canvas')).toBeNull();
    });
});
