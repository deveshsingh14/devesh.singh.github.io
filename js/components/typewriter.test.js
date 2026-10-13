import { jest } from '@jest/globals';
import { initTypewriter } from './typewriter.js';

describe('Typewriter Component', () => {
    let typewriterElement;

    beforeEach(() => {
        document.body.innerHTML = `
            <span id="typewriter"></span>
        `;
        typewriterElement = document.getElementById('typewriter');
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    it('does not crash if typewriter element is missing', () => {
        document.body.innerHTML = ''; // Remove the element
        expect(() => {
            initTypewriter();
            jest.runAllTimers();
        }).not.toThrow();
    });

    it('types the first phrase correctly', () => {
        initTypewriter();

        // Initially, the first call happens synchronously.
        expect(typewriterElement.innerHTML).toBe('A');

        // Advance by 100ms -> 'AW'
        jest.advanceTimersByTime(100);
        expect(typewriterElement.innerHTML).toBe('AW');

        // Advance to full phrase 'AWS infrastructure.' (19 characters)
        // We already did 1 char sync and 1 char async (100ms)
        // 17 more chars = 1700ms
        jest.advanceTimersByTime(1700);
        expect(typewriterElement.innerHTML).toBe('AWS infrastructure.');
    });

    it('pauses and then deletes the phrase', () => {
        initTypewriter();

        // Advance time to full phrase
        jest.advanceTimersByTime(1800);
        expect(typewriterElement.innerHTML).toBe('AWS infrastructure.');

        // It should pause for 2000ms before deleting
        jest.advanceTimersByTime(1999);
        expect(typewriterElement.innerHTML).toBe('AWS infrastructure.');

        jest.advanceTimersByTime(1);
        // After 2000ms, it deletes 1 char
        expect(typewriterElement.innerHTML).toBe('AWS infrastructure');

        // Advance to completely deleted (18 more chars * 50ms = 900ms)
        jest.advanceTimersByTime(900);
        expect(typewriterElement.innerHTML).toBe('');
    });

    it('cycles to the next phrase after deleting', () => {
        initTypewriter();

        // Advance to full phrase
        jest.advanceTimersByTime(1800);
        // Advance pause
        jest.advanceTimersByTime(2000);
        // Advance deletion
        jest.advanceTimersByTime(900);

        expect(typewriterElement.innerHTML).toBe('');

        // Pause before next phrase is 500ms
        jest.advanceTimersByTime(499);
        expect(typewriterElement.innerHTML).toBe('');

        jest.advanceTimersByTime(1);
        // Starts typing the next phrase
        expect(typewriterElement.innerHTML).toBe('f'); // First letter of "full-stack Node.js apps."

        jest.advanceTimersByTime(100);
        expect(typewriterElement.innerHTML).toBe('fu');
    });
});
