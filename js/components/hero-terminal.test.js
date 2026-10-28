import { jest } from '@jest/globals';
import { initHeroTerminal } from './hero-terminal.js';

describe('hero-terminal', () => {
    let heroTermOutput;
    let heroTermInput;
    let heroTermGhost;
    let heroTermBody;

    beforeEach(() => {
        document.body.innerHTML = `
            <div class="hero-terminal">
                <div id="hero-term-body"></div>
                <div id="hero-term-output"></div>
                <div style="position: relative;">
                    <span id="hero-term-ghost"></span>
                    <input id="hero-term-input" />
                </div>
            </div>
        `;

        heroTermOutput = document.getElementById('hero-term-output');
        heroTermInput = document.getElementById('hero-term-input');
        heroTermGhost = document.getElementById('hero-term-ghost');
        heroTermBody = document.getElementById('hero-term-body');

        global.DOMPurify = {
            sanitize: jest.fn((html, options) => {
                if (options && options.RETURN_DOM_FRAGMENT) {
                    const template = document.createElement('template');
                    template.innerHTML = html;
                    return template.content;
                }
                return html;
            })
        };

        global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 0));

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

        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
        delete global.DOMPurify;
        delete global.requestAnimationFrame;
        document.body.innerHTML = '';
    });

    it('initializes and shows welcome message', () => {
        initHeroTerminal();
        jest.runAllTimers();
        expect(heroTermOutput.innerHTML).toContain('Welcome to Devesh');
    });

    it('handles "clear" command correctly', () => {
        initHeroTerminal();
        jest.runAllTimers();
        expect(heroTermOutput.innerHTML).toContain('Welcome to Devesh');

        heroTermInput.value = 'clear';
        const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        heroTermInput.dispatchEvent(enterEvent);

        expect(heroTermOutput.innerHTML).toBe('');
    });

    it('handles unknown command correctly', () => {
        initHeroTerminal();
        jest.runAllTimers();

        heroTermInput.value = 'unknown_cmd';
        const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        heroTermInput.dispatchEvent(enterEvent);
        jest.runAllTimers();

        expect(heroTermOutput.innerHTML).toContain('command not found: unknown_cmd');
    });

    it('handles "sudo rm -rf" command correctly', () => {
        initHeroTerminal();
        jest.runAllTimers();

        heroTermInput.value = 'sudo rm -rf /';
        const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        heroTermInput.dispatchEvent(enterEvent);
        jest.runAllTimers();

        expect(heroTermOutput.innerHTML).toContain('Permission denied: nice try.');
    });

    it('handles all built-in commands', () => {
        initHeroTerminal();
        jest.runAllTimers();

        const commands = [
            { cmd: 'help', expected: 'Available commands:' },
            { cmd: 'whoami', expected: 'devesh-singh-baish' },
            { cmd: 'skills', expected: 'Languages:' },
            { cmd: 'experience', expected: 'DevOps Engineer' },
            { cmd: 'projects', expected: 'Radha' },
            { cmd: 'contact', expected: 'email:' }
        ];

        commands.forEach(({ cmd, expected }) => {
            heroTermOutput.innerHTML = ''; // Clear for easier checking
            heroTermInput.value = cmd;
            const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
            heroTermInput.dispatchEvent(enterEvent);
            jest.runAllTimers();
            expect(heroTermOutput.innerHTML).toContain(expected);
        });
    });

    it('handles tab completion', () => {
        initHeroTerminal();
        jest.runAllTimers();

        heroTermInput.value = 'he';
        const inputEvent = new Event('input');
        heroTermInput.dispatchEvent(inputEvent);
        expect(heroTermGhost.textContent).toBe('help');

        const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
        heroTermInput.dispatchEvent(tabEvent);
        expect(heroTermInput.value).toBe('help');
    });

    it('handles arrow up and down for history', () => {
        initHeroTerminal();
        jest.runAllTimers();

        heroTermInput.value = 'cmd1';
        heroTermInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

        heroTermInput.value = 'cmd2';
        heroTermInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

        // Up arrow should get cmd2
        heroTermInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
        expect(heroTermInput.value).toBe('cmd2');

        // Up arrow again should get cmd1
        heroTermInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
        expect(heroTermInput.value).toBe('cmd1');

        // Down arrow should get cmd2
        heroTermInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
        expect(heroTermInput.value).toBe('cmd2');

        // Down arrow again should be empty
        heroTermInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
        expect(heroTermInput.value).toBe('');
    });

    it('focuses input when clicking body', () => {
        initHeroTerminal();
        jest.runAllTimers();

        heroTermInput.focus = jest.fn();
        const clickEvent = new MouseEvent('click');
        heroTermBody.dispatchEvent(clickEvent);

        expect(heroTermInput.focus).toHaveBeenCalledWith({ preventScroll: true });
    });
});
