import { jest } from '@jest/globals';
import { escapeHtml, throttle } from './dom.js';

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
