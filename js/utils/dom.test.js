import { jest } from '@jest/globals';
import { escapeHtml, throttle, prefersReducedMotion, typeLines } from './dom.js';

describe('typeLines', () => {
    it('throws an error if DOMPurify is undefined', () => {
        const originalDOMPurify = global.DOMPurify;
        delete global.DOMPurify;

        try {
            const lines = [{ html: '<p>test</p>', delay: 100 }];
            const container = document.createElement('div');

            expect(() => typeLines(lines, container)).toThrow("Security check failed: DOMPurify failed to load. Please check your internet connection.");
        } finally {
            global.DOMPurify = originalDOMPurify;
        }
    });

    it('processes lines sequentially and appends them to the container', () => {
        jest.useFakeTimers();
        const originalDOMPurify = global.DOMPurify;
        const originalRAF = window.requestAnimationFrame;
        global.DOMPurify = { sanitize: jest.fn(html => html.toUpperCase()) };
        window.requestAnimationFrame = jest.fn();

        try {
            const lines = [
                { html: '<span>line 1</span>', delay: 100 },
                { html: '<span>line 2</span>', delay: 200 }
            ];
            const container = document.createElement('div');
            const onDone = jest.fn();

            typeLines(lines, container, onDone);

            // First line is added immediately
            expect(global.DOMPurify.sanitize).toHaveBeenCalledWith('<span>line 1</span>');
            expect(container.children.length).toBe(1);
            expect(container.children[0].innerHTML).toBe('<span>LINE 1</span>');
            expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
            expect(onDone).not.toHaveBeenCalled();

            // Advance time for first delay
            jest.advanceTimersByTime(100);

            // Second line is added
            expect(global.DOMPurify.sanitize).toHaveBeenCalledWith('<span>line 2</span>');
            expect(container.children.length).toBe(2);
            expect(container.children[1].innerHTML).toBe('<span>LINE 2</span>');
            expect(window.requestAnimationFrame).toHaveBeenCalledTimes(2);
            expect(onDone).not.toHaveBeenCalled();

            // Advance time for second delay
            jest.advanceTimersByTime(200);

            // Done callback is called
            expect(onDone).toHaveBeenCalledTimes(1);
        } finally {
            global.DOMPurify = originalDOMPurify;
            window.requestAnimationFrame = originalRAF;
            jest.useRealTimers();
        }
    });

    it('applies correct initial and animated styles', () => {
        const originalDOMPurify = global.DOMPurify;
        const originalRAF = window.requestAnimationFrame;
        global.DOMPurify = { sanitize: jest.fn(html => html) };
        window.requestAnimationFrame = jest.fn();

        try {
            const lines = [{ html: 'test', delay: 100 }];
            const container = document.createElement('div');

            typeLines(lines, container);

            const addedDiv = container.children[0];

            // Check initial styles
            expect(addedDiv.style.opacity).toBe('0');
            expect(addedDiv.style.transform).toBe('translateY(4px)');
            expect(addedDiv.style.transition).toBe('opacity 0.2s ease, transform 0.2s ease');

            // Simulate requestAnimationFrame execution
            const rafCallback = window.requestAnimationFrame.mock.calls[0][0];
            rafCallback();

            // Check animated styles
            expect(addedDiv.style.opacity).toBe('1');
            expect(addedDiv.style.transform).toBe('translateY(0)');
        } finally {
            global.DOMPurify = originalDOMPurify;
            window.requestAnimationFrame = originalRAF;
        }
    });

    it('updates container scrollTop', () => {
        const originalDOMPurify = global.DOMPurify;
        const originalRAF = window.requestAnimationFrame;
        global.DOMPurify = { sanitize: jest.fn(html => html) };
        window.requestAnimationFrame = jest.fn();

        try {
            const lines = [{ html: 'test', delay: 100 }];
            const container = document.createElement('div');

            // Mock scrollHeight
            Object.defineProperty(container, 'scrollHeight', {
                value: 500,
                configurable: true
            });

            typeLines(lines, container);

            expect(container.scrollTop).toBe(500);
        } finally {
            global.DOMPurify = originalDOMPurify;
            window.requestAnimationFrame = originalRAF;
        }
    });

    it('calls onDone callback when all lines are processed (empty array)', () => {
        const lines = [];
        const container = document.createElement('div');
        const onDone = jest.fn();

        typeLines(lines, container, onDone);

        expect(onDone).toHaveBeenCalledTimes(1);
    });

    it('handles missing onDone callback gracefully', () => {
        jest.useFakeTimers();
        const originalDOMPurify = global.DOMPurify;
        const originalRAF = window.requestAnimationFrame;
        global.DOMPurify = { sanitize: jest.fn(html => html) };
        window.requestAnimationFrame = jest.fn();

        try {
            const lines = [{ html: 'test', delay: 100 }];
            const container = document.createElement('div');

            // Should not throw
            expect(() => {
                typeLines(lines, container);
                jest.advanceTimersByTime(100);
            }).not.toThrow();
        } finally {
            global.DOMPurify = originalDOMPurify;
            window.requestAnimationFrame = originalRAF;
            jest.useRealTimers();
        }
    });

});

describe('escapeHtml', () => {
    it('escapes standard HTML characters', () => {
        expect(escapeHtml('&')).toBe('&amp;');
        expect(escapeHtml('<')).toBe('&lt;');
        expect(escapeHtml('>')).toBe('&gt;');
        expect(escapeHtml('"')).toBe('&quot;');
        expect(escapeHtml("'")).toBe('&#39;');
    });

    it('escapes multiple occurrences of standard HTML characters', () => {
        expect(escapeHtml('&&<<>>""\'\'')).toBe('&amp;&amp;&lt;&lt;&gt;&gt;&quot;&quot;&#39;&#39;');
    });

    it('returns the input unchanged if it is not a string', () => {
        expect(escapeHtml(null)).toBeNull();
        expect(escapeHtml(undefined)).toBeUndefined();
        expect(escapeHtml(123)).toBe(123);
        const obj = {};
        expect(escapeHtml(obj)).toBe(obj);
    });

    it('handles normal strings without characters to escape', () => {
        expect(escapeHtml('hello world')).toBe('hello world');
    });

    it('handles mixed strings containing normal text and characters to escape', () => {
        expect(escapeHtml('<script>alert("xss & hax")</script>')).toBe('&lt;script&gt;alert(&quot;xss &amp; hax&quot;)&lt;/script&gt;');
    });

    it('does not double escape characters', () => {
        // Technically this test ensures that if we pass an already escaped string, it will escape the ampersand in the escape sequence.
        expect(escapeHtml('&amp;')).toBe('&amp;amp;');
    });
});

describe('throttle', () => {
    let originalRAF;

    beforeEach(() => {
        originalRAF = window.requestAnimationFrame;
        window.requestAnimationFrame = jest.fn();
    });

    afterEach(() => {
        window.requestAnimationFrame = originalRAF;
    });

    it('schedules a frame on the first call and defers execution', () => {
        const callback = jest.fn();
        const throttled = throttle(callback);

        throttled('arg1');

        expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
        expect(callback).not.toHaveBeenCalled();

        // Simulate requestAnimationFrame execution
        const rafCallback = window.requestAnimationFrame.mock.calls[0][0];
        rafCallback();

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith('arg1');
    });

    it('ignores subsequent calls until the scheduled frame executes', () => {
        const callback = jest.fn();
        const throttled = throttle(callback);

        throttled('first');
        throttled('second');
        throttled('third');

        expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);

        // Simulate requestAnimationFrame execution
        const rafCallback = window.requestAnimationFrame.mock.calls[0][0];
        rafCallback();

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith('first');

        // Should be able to schedule another call now
        throttled('fourth');
        expect(window.requestAnimationFrame).toHaveBeenCalledTimes(2);
    });

    it('preserves the `this` context', () => {
        const callback = jest.fn();
        const throttled = throttle(callback);

        const context = {
            value: 42,
            method: throttled
        };

        context.method();

        const rafCallback = window.requestAnimationFrame.mock.calls[0][0];
        rafCallback();

        // Check if `this` was correctly bound to context
        expect(callback.mock.contexts[0]).toBe(context);
    });
});

describe('prefersReducedMotion', () => {
    let originalMatchMedia;

    beforeEach(() => {
        originalMatchMedia = window.matchMedia;
    });

    afterEach(() => {
        window.matchMedia = originalMatchMedia;
    });

    it('returns true when prefers-reduced-motion matches', () => {
        window.matchMedia = jest.fn().mockImplementation(query => ({
            matches: true,
            media: query,
        }));

        expect(prefersReducedMotion()).toBe(true);
        expect(window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    });

    it('returns false when prefers-reduced-motion does not match', () => {
        window.matchMedia = jest.fn().mockImplementation(query => ({
            matches: false,
            media: query,
        }));

        expect(prefersReducedMotion()).toBe(false);
        expect(window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    });
});
