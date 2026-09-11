import { escapeHtml } from './dom.js';

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
