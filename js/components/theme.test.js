import { jest } from '@jest/globals';
import { initTheme } from './theme.js';

describe('theme toggling', () => {
    let originalLocalStorage;

    beforeEach(() => {
        // Mock DOM
        document.body.innerHTML = `
            <button id="theme-toggle"></button>
        `;
        document.documentElement.removeAttribute('data-theme');

        // Mock localStorage
        originalLocalStorage = Object.getOwnPropertyDescriptor(global, 'localStorage');
        Object.defineProperty(global, 'localStorage', {
            value: {
                setItem: jest.fn(),
                getItem: jest.fn(),
                removeItem: jest.fn(),
                clear: jest.fn(),
            },
            configurable: true
        });

        // Mock console.warn
        jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        if (originalLocalStorage) {
            Object.defineProperty(global, 'localStorage', originalLocalStorage);
        } else {
            delete global.localStorage;
        }
        jest.restoreAllMocks();
    });

    it('initializes and syncs state when data-theme is not set (defaults to dark)', () => {
        initTheme();

        const themeToggle = document.getElementById('theme-toggle');

        // Should default to dark
        expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
        expect(themeToggle.getAttribute('aria-pressed')).toBe('false');
        expect(themeToggle.getAttribute('aria-label')).toBe('Switch to light theme');
        expect(themeToggle.getAttribute('title')).toBe('Switch to light theme');
    });

    it('initializes and syncs state when data-theme is light', () => {
        document.documentElement.setAttribute('data-theme', 'light');
        initTheme();

        const themeToggle = document.getElementById('theme-toggle');

        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
        expect(themeToggle.getAttribute('aria-pressed')).toBe('true');
        expect(themeToggle.getAttribute('aria-label')).toBe('Switch to dark theme');
        expect(themeToggle.getAttribute('title')).toBe('Switch to dark theme');
    });

    it('toggles from dark to light on click', () => {
        initTheme();

        const themeToggle = document.getElementById('theme-toggle');

        // Click to toggle to light
        themeToggle.click();

        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
        expect(themeToggle.getAttribute('aria-pressed')).toBe('true');
        expect(themeToggle.getAttribute('aria-label')).toBe('Switch to dark theme');
        expect(themeToggle.getAttribute('title')).toBe('Switch to dark theme');
        expect(global.localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
    });

    it('toggles from light to dark on click', () => {
        document.documentElement.setAttribute('data-theme', 'light');
        initTheme();

        const themeToggle = document.getElementById('theme-toggle');

        // Click to toggle to dark
        themeToggle.click();

        expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
        expect(themeToggle.getAttribute('aria-pressed')).toBe('false');
        expect(themeToggle.getAttribute('aria-label')).toBe('Switch to light theme');
        expect(themeToggle.getAttribute('title')).toBe('Switch to light theme');
        expect(global.localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
    });

    it('handles localStorage errors gracefully', () => {
        global.localStorage.setItem.mockImplementation(() => {
            throw new Error('localStorage is unavailable');
        });

        initTheme();

        const themeToggle = document.getElementById('theme-toggle');

        // Click to toggle
        themeToggle.click();

        // DOM should still update
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');

        expect(console.warn).not.toHaveBeenCalled();
    });

    it('handles restricted localStorage access (e.g. SecurityError)', () => {
        const error = new Error('SecurityError: localStorage is restricted');

        Object.defineProperty(global, 'localStorage', {
            get: () => { throw error; },
            configurable: true
        });

        initTheme();
        const themeToggle = document.getElementById('theme-toggle');

        // Should not throw and still toggle theme
        expect(() => themeToggle.click()).not.toThrow();
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');

        expect(console.warn).not.toHaveBeenCalled();

        // originalLocalStorage is restored in afterEach which runs after this test, so no explicit finally is needed.
    });

    it('does nothing if theme toggle button is missing', () => {
        document.body.innerHTML = ''; // Remove the button
        expect(() => initTheme()).not.toThrow();
    });
});
