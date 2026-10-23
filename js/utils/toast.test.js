import { jest } from '@jest/globals';
import { showToast } from './toast.js';

describe('Toast Utility', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it('creates a toast container and appends a toast', () => {
        showToast('Test message');
        const container = document.getElementById('toast-container');
        expect(container).toBeTruthy();
        expect(container.childNodes.length).toBe(1);
        expect(container.firstChild.textContent).toBe('Test message');
        expect(container.firstChild.className).toBe('toast toast-success');
    });

    it('removes the toast after timeout', () => {
        showToast('Test message');
        const container = document.getElementById('toast-container');
        expect(container.childNodes.length).toBe(1);

        jest.advanceTimersByTime(3000);

        // Simulate transitionend event
        container.firstChild.dispatchEvent(new Event('transitionend'));

        expect(document.getElementById('toast-container')).toBeNull();
    });
});
