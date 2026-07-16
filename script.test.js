const fs = require('fs');
const path = require('path');

// Mock matchMedia
window.matchMedia = jest.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
}));

// Mock IntersectionObserver
class MockIntersectionObserver {
    constructor(callback) {
        this.callback = callback;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
}
window.IntersectionObserver = MockIntersectionObserver;

describe('script.js tests', () => {
  beforeEach(() => {
    const html = fs.readFileSync(path.resolve(__dirname, './index.html'), 'utf8');
    document.documentElement.innerHTML = html;

    // Mock getContext for canvas
    window.HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
        clearRect: jest.fn(),
        beginPath: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        stroke: jest.fn(),
    }));

    // We can evaluate script.js in this context
    jest.isolateModules(() => {
        require('./script.js');
    });

    // Fire DOMContentLoaded
    document.dispatchEvent(new Event('DOMContentLoaded'));
  });

  test('Spotlight Effect updates on mousemove', () => {
    // Only applied on non-touch devices, which we mocked
    window.matchMedia.mockImplementation(query => ({
        matches: true,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    }));

    // We have to reload script.js to re-evaluate with the new matchMedia mock
    jest.isolateModules(() => {
        require('./script.js');
    });

    document.dispatchEvent(new Event('DOMContentLoaded'));

    const spotlight = document.getElementById('spotlight');

    // Simulate mouse move
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: 100,
        clientY: 200,
    });
    document.dispatchEvent(mouseEvent);

    expect(spotlight.style.background).toContain('100px 200px');
  });

  test('Password generator generates a password on load', () => {
    const pgResult = document.getElementById('pg-result');
    expect(pgResult.value).not.toBe('');
    expect(pgResult.value.length).toBe(14); // Default length is 14
  });

  test('Password generator updates on length change', () => {
    const pgLength = document.getElementById('pg-length');
    const pgResult = document.getElementById('pg-result');

    pgLength.value = 20;
    pgLength.dispatchEvent(new Event('input'));

    expect(pgResult.value.length).toBe(20);
  });

  test('Password generator updates on checkboxes change', () => {
    const pgResult = document.getElementById('pg-result');
    const pgNums = document.getElementById('pg-nums');

    // Uncheck numbers
    pgNums.checked = false;
    pgNums.dispatchEvent(new Event('change'));

    const val = pgResult.value;
    // We can't guarantee no numbers if upper/lower is checked but let's check
    // Actually we can check that it has no numbers by matching regex
    expect(val).not.toMatch(/[0-9]/);
  });

  test('Passphrase generator generates a passphrase on load', () => {
    const ppResult = document.getElementById('pp-result');
    expect(ppResult.value).not.toBe('');
    // Expect 4 words on fresh load but because we reloaded script.js, it uses state... actually wait. Let's make it reliable.
    // The previous test changed the input to 5, and because the tests share the DOM instance it's kept at 5 unless reset.
    // So let's reset it here.
    const ppWords = document.getElementById('pp-words');
    ppWords.value = 4;
    ppWords.dispatchEvent(new Event('input'));

    const words = ppResult.value.split('-');
    expect(words.length).toBe(4);
  });

  test('Passphrase generator updates on word count change', () => {
    const ppWords = document.getElementById('pp-words');
    const ppResult = document.getElementById('pp-result');

    ppWords.value = 5;
    ppWords.dispatchEvent(new Event('input'));

    const words = ppResult.value.split('-');
    expect(words.length).toBe(5);
  });

  test('Passphrase generator copies to clipboard', () => {
      // Mock clipboard
      Object.assign(navigator, {
          clipboard: {
              writeText: jest.fn().mockImplementation(() => Promise.resolve()),
          },
      });

      const ppCopy = document.getElementById('pp-copy');
      const ppResult = document.getElementById('pp-result');

      ppCopy.dispatchEvent(new Event('click'));

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(ppResult.value);
      expect(ppCopy.innerText).toBe('Copied!');
  });
});
