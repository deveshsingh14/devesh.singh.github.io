const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.resolve(__dirname, './index.html'), 'utf8');

describe('generatePassphrase', () => {
    beforeEach(() => {
        document.documentElement.innerHTML = html.toString();
        // Load the script
        require('./script.js');
        // Trigger DOMContentLoaded
        document.dispatchEvent(new Event('DOMContentLoaded'));
    });

    afterEach(() => {
        jest.resetModules();
        jest.restoreAllMocks();
    });

    it('generates a passphrase with correct number of words', () => {
        const ppWords = document.getElementById('pp-words');
        const ppResult = document.getElementById('pp-result');
        const ppRefresh = document.getElementById('pp-refresh');

        ppWords.value = 4;
        ppRefresh.click();

        const words = ppResult.value.split('-');
        expect(words.length).toBe(4);
    });

    it('uses the specified separator', () => {
        const ppSep = document.getElementById('pp-sep');
        const ppResult = document.getElementById('pp-result');
        const ppRefresh = document.getElementById('pp-refresh');

        ppSep.value = '_';
        ppRefresh.click();

        expect(ppResult.value).toContain('_');
        expect(ppResult.value).not.toContain('-');
    });

    it('capitalizes words when requested', () => {
        const ppCap = document.getElementById('pp-cap');
        const ppResult = document.getElementById('pp-result');
        const ppRefresh = document.getElementById('pp-refresh');

        ppCap.checked = true;
        ppRefresh.click();

        const words = ppResult.value.split('-');
        words.forEach(word => {
            expect(word[0]).toMatch(/[A-Z]/);
        });
    });

    it('does not capitalize words when not requested', () => {
        const ppCap = document.getElementById('pp-cap');
        const ppResult = document.getElementById('pp-result');
        const ppRefresh = document.getElementById('pp-refresh');

        ppCap.checked = false;
        ppRefresh.click();

        const words = ppResult.value.split('-');
        words.forEach(word => {
            expect(word[0]).toMatch(/[a-z]/);
        });
    });
});
