import { jest } from '@jest/globals';
import { createPasswordString, initTools } from './tools.js';

describe('Clipboard Error Handling', () => {
    it('handles clipboard error', async () => {
        document.body.innerHTML = `
            <input type="range" id="pg-length" min="5" max="128" value="14">
            <label id="pg-length-label"></label>
            <input type="checkbox" id="pg-upper" checked>
            <input type="checkbox" id="pg-lower" checked>
            <input type="checkbox" id="pg-nums" checked>
            <input type="checkbox" id="pg-syms">
            <input type="number" id="pg-min-nums" value="1">
            <input type="number" id="pg-min-syms" value="0">
            <input type="checkbox" id="pg-ambig">
            <span id="pg-announcer"></span>

            <input type="text" id="pg-result" value="test-pass">
            <button id="pg-refresh">Refresh</button>
            <button id="pg-copy">Copy</button>
            <span id="pg-copy-announcer"></span>

            <input type="range" id="pp-words" min="3" max="12" value="4">
            <label id="pp-words-label"></label>
            <input type="text" id="pp-sep" value="-">
            <input type="checkbox" id="pp-cap">

            <input type="text" id="pp-result">
            <button id="pp-refresh"></button>
            <button id="pp-copy">Copy</button>
            <span id="pp-copy-announcer"></span>
        `;

        let writeTextMock = jest.fn().mockRejectedValue(new Error('Clipboard error'));
        const originalClipboard = navigator.clipboard;
        Object.defineProperty(navigator, 'clipboard', {
            value: { writeText: writeTextMock },
            configurable: true
        });

        const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

        try {
            initTools();

            const copyBtn = document.getElementById('pg-copy');
            copyBtn.click();

            await new Promise(resolve => setTimeout(resolve, 0)); // flush promises

            expect(consoleErrorMock).toHaveBeenCalledWith('Failed to copy text to clipboard:', expect.any(Error));
            expect(copyBtn.innerText).toBe('Error');
            expect(document.getElementById('pg-copy-announcer').textContent).toBe('Error copying to clipboard');
        } finally {
            Object.defineProperty(navigator, 'clipboard', {
                value: originalClipboard,
                configurable: true
            });
            consoleErrorMock.mockRestore();
            document.body.innerHTML = '';
        }
    });
});

describe('createPasswordString', () => {

    beforeEach(() => {
        let mockValues = [123456789, 987654321, 111111111, 222222222, 333333333, 444444444, 555555555, 666666666];
        let mockIndex = 0;
        jest.spyOn(window.crypto, 'getRandomValues').mockImplementation((arr) => {
            for (let i = 0; i < arr.length; i++) {
                arr[i] = mockValues[mockIndex % mockValues.length];
                mockIndex++;
            }
            return arr;
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns an error if no character sets are selected', () => {
        const options = {
            length: 12,
            useUpper: false,
            useLower: false,
            useNums: false,
            useSyms: false,
            avoidAmbig: false,
            minNums: 0,
            minSyms: 0
        };
        const result = createPasswordString(options);
        expect(result.error).toBe("Select at least one character set.");
    });
    it('generates a password with correct length', () => {
        const options = {
            length: 15,
            useUpper: true,
            useLower: true,
            useNums: true,
            useSyms: true,
            avoidAmbig: false,
            minNums: 0,
            minSyms: 0
        };
        const result = createPasswordString(options);
        expect(result.password).toBeDefined();
        expect(result.password.length).toBe(15);
    });

    it('generates a password with only uppercase letters', () => {
        const options = {
            length: 10,
            useUpper: true,
            useLower: false,
            useNums: false,
            useSyms: false,
            avoidAmbig: false,
            minNums: 0,
            minSyms: 0
        };
        const result = createPasswordString(options);
        expect(result.password).toMatch(/^[A-Z]+$/);
        expect(result.password.length).toBe(10);
    });

    it('avoids ambiguous characters when avoidAmbig is true', () => {
        const options = {
            length: 100, // Make it long to increase chance of hitting all characters
            useUpper: true,
            useLower: true,
            useNums: true,
            useSyms: false,
            avoidAmbig: true,
            minNums: 0,
            minSyms: 0
        };

        // We might need to make getRandomValues less deterministic for this test to be meaningful,
        // or we just test the logic that filters the characters. Let's run it multiple times with
        // different deterministic values to ensure it works.
        const AMBIGUOUS_CHARS = "l1IO0";
        const result = createPasswordString(options);

        for (const char of AMBIGUOUS_CHARS) {
            expect(result.password.includes(char)).toBe(false);
        }
    });

    it('includes minimum number of numbers', () => {
        const options = {
            length: 10,
            useUpper: true,
            useLower: false,
            useNums: true,
            useSyms: false,
            avoidAmbig: false,
            minNums: 4,
            minSyms: 0
        };
        const result = createPasswordString(options);
        const nums = result.password.match(/[0-9]/g) || [];
        expect(nums.length).toBeGreaterThanOrEqual(4);
    });

    it('includes minimum number of symbols', () => {
        const options = {
            length: 10,
            useUpper: true,
            useLower: false,
            useNums: false,
            useSyms: true,
            avoidAmbig: false,
            minNums: 0,
            minSyms: 3
        };
        const result = createPasswordString(options);
        const syms = result.password.match(/[!@#$%^&*]/g) || [];
        expect(syms.length).toBeGreaterThanOrEqual(3);
    });
});
