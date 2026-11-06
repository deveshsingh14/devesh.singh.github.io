import { jest } from '@jest/globals';
import { initAboutCrew } from './about-crew.js';

describe('about cursor crew', () => {
    const OriginalObserver = window.IntersectionObserver;
    const originalMatchMedia = window.matchMedia;
    let observed;
    let fire;

    beforeEach(() => {
        document.body.innerHTML = `
            <section id="about">
                <h2 class="section-title">About Me</h2>
                <div class="text-block"><p>One <a class="highlight-link" href="#">link</a></p><p>Two</p><p>Three</p></div>
                <div class="about-illustration"><svg><g class="crew-part"></g></svg></div>
            </section>
        `;
        observed = jest.fn();
        window.IntersectionObserver = class {
            constructor(cb) { fire = () => cb([{ isIntersecting: true }]); }
            observe(el) { observed(el); }
            disconnect() {}
        };
    });

    afterEach(() => {
        window.IntersectionObserver = OriginalObserver;
        window.matchMedia = originalMatchMedia;
    });

    test('does nothing when the About section is missing', () => {
        document.body.innerHTML = '';
        expect(() => initAboutCrew()).not.toThrow();
        expect(observed).not.toHaveBeenCalled();
    });

    test('leaves the section untouched for reduced-motion visitors', () => {
        window.matchMedia = (query) => ({ matches: query.includes('reduce') });
        initAboutCrew();
        expect(observed).not.toHaveBeenCalled();
        expect(document.querySelector('.section-title').textContent).toBe('About Me');
    });

    test('waits for About to be visible before turning it into a blueprint', () => {
        initAboutCrew();
        expect(observed).toHaveBeenCalledWith(document.getElementById('about'));
        expect(document.getElementById('about').classList.contains('crew-pending')).toBe(false);
        expect(document.querySelector('.crew-layer')).toBeNull();
    });

    test('builds the blueprint and the crew when About comes into view', () => {
        window.requestAnimationFrame = jest.fn();
        initAboutCrew();
        fire();
        const about = document.getElementById('about');
        expect(about.classList.contains('crew-pending')).toBe(true);
        expect(about.querySelectorAll('.crew-blk')).toHaveLength(3);
        expect(about.querySelectorAll('.crew-ptr')).toHaveLength(7);
        expect(about.querySelector('.crew-blk p').textContent).toContain('One');
    });
});
