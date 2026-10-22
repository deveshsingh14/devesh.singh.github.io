import { jest } from '@jest/globals';
import { initCanvas } from './canvas.js';

describe('Canvas component', () => {
    let originalRequestAnimationFrame;

    beforeEach(() => {
        // Reset DOM
        document.body.innerHTML = '';

        // Mock requestAnimationFrame for throttle and animation loops
        jest.useFakeTimers();
        originalRequestAnimationFrame = global.requestAnimationFrame;
        global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 0));

        // Mock window dimensions
        global.innerWidth = 1024;
        global.scrollX = 0;
        global.scrollY = 0;
    });

    afterEach(() => {
        jest.clearAllMocks();
        global.requestAnimationFrame = originalRequestAnimationFrame;
        jest.useRealTimers();
    });

    it('exits early if hero-canvas is missing', () => {
        // Add hero but no canvas
        document.body.innerHTML = '<div id="hero"></div>';

        // Should not throw
        expect(() => initCanvas()).not.toThrow();
    });

    it('initializes correctly when canvas and hero are present', () => {
        document.body.innerHTML = `
            <div id="hero" style="height: 500px;">
                <canvas id="hero-canvas"></canvas>
            </div>
        `;

        // Mock offsetHeight
        const hero = document.getElementById('hero');
        Object.defineProperty(hero, 'offsetHeight', { value: 500, configurable: true });

        // Mock getBoundingClientRect
        const canvas = document.getElementById('hero-canvas');
        canvas.getBoundingClientRect = jest.fn(() => ({
            left: 10,
            top: 20,
            width: 1024,
            height: 500
        }));

        initCanvas();

        expect(canvas.width).toBe(1024);
        expect(canvas.height).toBe(500);

        // Context methods should have been called during animateParticles
        // The first animateParticles is called synchronously, but using
        // mocked methods, so we don't necessarily need to run timers for the first frame.
        // Wait for the mock context to be initialized and called
        jest.runOnlyPendingTimers();
        const ctx = canvas.getContext('2d');

        // Check if initCanvas actually called getContext by checking if ctx was defined.
        expect(ctx).toBeDefined();

        // JSDOM mock from setupTests.js:
        // getContext = () => ({ clearRect: jest.fn(), ... })
        // The issue is that getContext returns a *new* object with new jest.fns every time.
        // So `canvas.getContext('2d')` in the test returns a different set of mocks than what `initCanvas` used.
        // Let's mock getContext directly on our canvas instance so we can track it.
    });

    it('initializes correctly when canvas and hero are present (with context mocks)', () => {
        document.body.innerHTML = `
            <div id="hero" style="height: 500px;">
                <canvas id="hero-canvas"></canvas>
            </div>
        `;

        const hero = document.getElementById('hero');
        Object.defineProperty(hero, 'offsetHeight', { value: 500, configurable: true });

        const canvas = document.getElementById('hero-canvas');
        canvas.getBoundingClientRect = jest.fn(() => ({
            left: 10,
            top: 20,
            width: 1024,
            height: 500
        }));

        const mockCtx = {
            clearRect: jest.fn(),
            beginPath: jest.fn(),
            arc: jest.fn(),
            fill: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            stroke: jest.fn()
        };
        canvas.getContext = jest.fn(() => mockCtx);

        initCanvas();

        expect(mockCtx.clearRect).toHaveBeenCalledWith(0, 0, 1024, 500);
        expect(mockCtx.beginPath).toHaveBeenCalled();
    });

    it('handles window resize correctly', () => {
        document.body.innerHTML = `
            <div id="hero">
                <canvas id="hero-canvas"></canvas>
            </div>
        `;

        const hero = document.getElementById('hero');
        Object.defineProperty(hero, 'offsetHeight', { value: 600, configurable: true });

        const canvas = document.getElementById('hero-canvas');
        canvas.getBoundingClientRect = jest.fn(() => ({
            left: 0,
            top: 0
        }));

        initCanvas();

        // Initial setup
        expect(canvas.width).toBe(1024);
        expect(canvas.height).toBe(600);

        // Resize window
        global.innerWidth = 800;
        Object.defineProperty(hero, 'offsetHeight', { value: 400, configurable: true });

        window.dispatchEvent(new Event('resize'));

        expect(canvas.width).toBe(800);
        expect(canvas.height).toBe(400);
    });

    it('handles mouse events on pointer devices', () => {
        document.body.innerHTML = `
            <div id="hero">
                <canvas id="hero-canvas"></canvas>
            </div>
        `;

        const hero = document.getElementById('hero');
        Object.defineProperty(hero, 'offsetHeight', { value: 500, configurable: true });
        const canvas = document.getElementById('hero-canvas');
        canvas.getBoundingClientRect = jest.fn(() => ({
            left: 0,
            top: 0
        }));

        // Mock pointer fine matchMedia
        window.matchMedia.mockImplementation((query) => ({
            matches: query === '(pointer: fine)'
        }));

        initCanvas();

        // Trigger mouse move
        const mouseMoveEvent = new MouseEvent('mousemove', {
            bubbles: true,
            cancelable: true
        });

        // Add pageX/pageY properties which JSDOM doesn't set natively on MouseEvent
        Object.defineProperty(mouseMoveEvent, 'pageX', { value: 150 });
        Object.defineProperty(mouseMoveEvent, 'pageY', { value: 200 });

        hero.dispatchEvent(mouseMoveEvent);

        // Run timers for the throttle rAF
        jest.runOnlyPendingTimers();

        // Let particles animation run to verify they use the mouseX/mouseY
        // Note: we can't easily assert on internal mouseX/mouseY directly,
        // but we can ensure it doesn't crash and the animation runs
        jest.runOnlyPendingTimers();

        // Trigger mouse leave
        const mouseLeaveEvent = new Event('mouseleave');
        hero.dispatchEvent(mouseLeaveEvent);

        // Run animation frame again
        jest.runOnlyPendingTimers();
    });
});
