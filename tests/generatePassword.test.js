const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

describe('generatePassword', () => {
    beforeEach(() => {
        document.documentElement.innerHTML = html.toString();

        // Mock matchMedia
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: jest.fn().mockImplementation(query => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: jest.fn(),
                removeListener: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                dispatchEvent: jest.fn(),
            })),
        });

        // Mock IntersectionObserver
        class IntersectionObserver {
            constructor() {}
            observe() {}
            unobserve() {}
            disconnect() {}
        }
        window.IntersectionObserver = IntersectionObserver;

        // Mock ResizeObserver
        class ResizeObserver {
            constructor() {}
            observe() {}
            unobserve() {}
            disconnect() {}
        }
        window.ResizeObserver = ResizeObserver;

        // Mock canvas and getContext
        HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
            clearRect: jest.fn(),
            beginPath: jest.fn(),
            arc: jest.fn(),
            fill: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            stroke: jest.fn(),
        }));

        // Expose generatePassword by replacing its definition to make it global
        // without breaking lexical scope. We'll simply append an export at the end of the script
        // or attach it to window.

        let scriptContent = fs.readFileSync(path.resolve(__dirname, '../script.js'), 'utf8');

        // Expose generatePassword to window so we can test it using a more robust Regex
        scriptContent = scriptContent.replace(
            /function\s+generatePassword\s*\(\)\s*\{/,
            'window.test_generatePassword = generatePassword;\n    function generatePassword() {'
        );

        // We evaluate the whole script to maintain lexical scoping and closures
        eval(scriptContent);

        // The script wraps everything in DOMContentLoaded
        // So we trigger it to initialize variables inside that scope
        const event = document.createEvent('Event');
        event.initEvent('DOMContentLoaded', true, true);
        window.document.dispatchEvent(event);
    });

    test('generates password of correct length', () => {
        const pgLength = document.getElementById('pg-length');
        const pgResult = document.getElementById('pg-result');

        pgLength.value = "10";
        window.test_generatePassword();
        expect(pgResult.value.length).toBe(10);

        pgLength.value = "20";
        window.test_generatePassword();
        expect(pgResult.value.length).toBe(20);
    });

    test('shows error when no character sets are selected', () => {
        document.getElementById('pg-upper').checked = false;
        document.getElementById('pg-lower').checked = false;
        document.getElementById('pg-nums').checked = false;
        document.getElementById('pg-syms').checked = false;

        window.test_generatePassword();
        expect(document.getElementById('pg-result').value).toBe("Select at least one character set.");
    });

    test('generates password with only uppercase letters', () => {
        document.getElementById('pg-upper').checked = true;
        document.getElementById('pg-lower').checked = false;
        document.getElementById('pg-nums').checked = false;
        document.getElementById('pg-syms').checked = false;
        document.getElementById('pg-min-nums').value = "0";
        document.getElementById('pg-min-syms').value = "0";

        window.test_generatePassword();
        expect(document.getElementById('pg-result').value).toMatch(/^[A-Z]+$/);
    });

    test('generates password with only lowercase letters', () => {
        document.getElementById('pg-upper').checked = false;
        document.getElementById('pg-lower').checked = true;
        document.getElementById('pg-nums').checked = false;
        document.getElementById('pg-syms').checked = false;
        document.getElementById('pg-min-nums').value = "0";
        document.getElementById('pg-min-syms').value = "0";

        window.test_generatePassword();
        expect(document.getElementById('pg-result').value).toMatch(/^[a-z]+$/);
    });

    test('generates password with minimum numbers', () => {
        document.getElementById('pg-upper').checked = true;
        document.getElementById('pg-lower').checked = false;
        document.getElementById('pg-nums').checked = true;
        document.getElementById('pg-syms').checked = false;
        document.getElementById('pg-min-nums').value = "5";
        document.getElementById('pg-min-syms').value = "0";
        document.getElementById('pg-length').value = "10";

        window.test_generatePassword();
        const numCount = (document.getElementById('pg-result').value.match(/[0-9]/g) || []).length;
        expect(numCount).toBeGreaterThanOrEqual(5);
    });

    test('generates password with minimum symbols', () => {
        document.getElementById('pg-upper').checked = true;
        document.getElementById('pg-lower').checked = false;
        document.getElementById('pg-nums').checked = false;
        document.getElementById('pg-syms').checked = true;
        document.getElementById('pg-min-nums').value = "0";
        document.getElementById('pg-min-syms').value = "4";
        document.getElementById('pg-length').value = "10";

        window.test_generatePassword();
        const symCount = (document.getElementById('pg-result').value.match(/[!@#$%^&*]/g) || []).length;
        expect(symCount).toBeGreaterThanOrEqual(4);
    });

    test('avoids ambiguous characters when checked', () => {
        document.getElementById('pg-upper').checked = true;
        document.getElementById('pg-lower').checked = true;
        document.getElementById('pg-nums').checked = true;
        document.getElementById('pg-syms').checked = false;
        document.getElementById('pg-ambig').checked = true;
        document.getElementById('pg-min-nums').value = "0";
        document.getElementById('pg-min-syms').value = "0";
        document.getElementById('pg-length').value = "50"; // Generate a long password

        // Run multiple times
        for (let i = 0; i < 10; i++) {
            window.test_generatePassword();
            expect(document.getElementById('pg-result').value).not.toMatch(/[l1IO0]/);
        }
    });
});
