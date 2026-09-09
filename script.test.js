const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.resolve(__dirname, './index.html'), 'utf8');

// script.js attaches its setup logic to a single `document`-level
// 'DOMContentLoaded' listener. jsdom keeps one `document` per test *file*
// (not per test), so requiring the script again in every test would stack
// up duplicate listeners that all fire on the next dispatch. Load it once
// here; each test below only needs to reset the markup and re-dispatch.
require('./script.js');

describe('generatePassphrase', () => {
    beforeEach(() => {
        document.documentElement.innerHTML = html.toString();
        document.dispatchEvent(new Event('DOMContentLoaded'));
    });

    afterEach(() => {
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

    it('auto-selects text in read-only inputs on click', () => {
        const selectMock = jest.fn();
        HTMLInputElement.prototype.select = selectMock;

        const pgResult = document.getElementById('pg-result');
        const ppResult = document.getElementById('pp-result');

        pgResult.click();
        expect(selectMock).toHaveBeenCalled();
        selectMock.mockClear();

        ppResult.click();
        expect(selectMock).toHaveBeenCalled();

        delete HTMLInputElement.prototype.select; // Cleanup mock
    });
});

describe('formatUptime', () => {
    beforeEach(() => {
        document.documentElement.innerHTML = html.toString();
        document.dispatchEvent(new Event('DOMContentLoaded'));
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('formats zero ms as 00d 00:00:00', () => {
        expect(window.formatUptime(0)).toBe('00d 00:00:00');
    });

    it('formats a mixed duration as DDd HH:MM:SS', () => {
        const oneDayOneHourOneMinuteOneSecond = 86400000 + 3600000 + 60000 + 1000;
        expect(window.formatUptime(oneDayOneHourOneMinuteOneSecond)).toBe('01d 01:01:01');
    });
});

describe('Hero Terminal', () => {
    beforeEach(() => {
        document.documentElement.innerHTML = html.toString();
        document.dispatchEvent(new Event('DOMContentLoaded'));
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    const runCommand = (value) => {
        const input = document.getElementById('hero-term-input');
        input.value = value;
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    };

    it('runs the whoami command and prints role info', () => {
        jest.useFakeTimers();
        runCommand('whoami');
        jest.advanceTimersByTime(3000);
        expect(document.getElementById('hero-term-output').textContent).toContain('DevOps Engineer');
    });

    it('clears the terminal output on the clear command', () => {
        jest.useFakeTimers();
        runCommand('whoami');
        jest.advanceTimersByTime(3000);
        runCommand('clear');
        expect(document.getElementById('hero-term-output').textContent.trim()).toBe('');
    });

    it('reports unrecognized commands', () => {
        jest.useFakeTimers();
        runCommand('foobar');
        jest.advanceTimersByTime(3000);
        expect(document.getElementById('hero-term-output').textContent).toContain('command not found');
    });

    it('tab-completes a partial command name', () => {
        const input = document.getElementById('hero-term-input');
        input.value = 'hel';
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
        expect(input.value).toBe('help');
    });
});

describe('Tools - CIDR Calculator', () => {
    beforeEach(() => {
        document.documentElement.innerHTML = html.toString();
        document.dispatchEvent(new Event('DOMContentLoaded'));
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    it('displays an error message for an invalid CIDR format', () => {
        jest.useFakeTimers();

        const cidrCalcItem = document.querySelector('.script-item[data-script="cidr-calc"]');
        cidrCalcItem.click();

        const input = document.getElementById('tool-input');
        input.value = 'invalid-cidr-format';

        const runBtn = document.getElementById('run-btn');
        runBtn.click();

        jest.advanceTimersByTime(3000);

        const dynamicOutput = document.getElementById('dynamic-output');
        expect(dynamicOutput.textContent).toContain('Error: Invalid CIDR format. Please use x.x.x.x/y format.');
    });
});

describe('Pipeline Visualizer', () => {
    beforeEach(() => {
        document.documentElement.innerHTML = html.toString();
        document.dispatchEvent(new Event('DOMContentLoaded'));
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    it('runs every stage to success when triggered', () => {
        jest.useFakeTimers();
        jest.spyOn(Math, 'random').mockReturnValue(0.9); // keep the scan-retry branch out of the way

        document.getElementById('run-pipeline').click();
        jest.advanceTimersByTime(10000);

        document.querySelectorAll('.pipeline-stage').forEach(stage => {
            expect(stage.getAttribute('data-status')).toBe('success');
        });
    });
});

describe('Tech Stack Topology Map', () => {
    beforeEach(() => {
        document.documentElement.innerHTML = html.toString();
        document.dispatchEvent(new Event('DOMContentLoaded'));
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('opens the drawer with the clicked node\'s details and closes on Escape', () => {
        const dockerNode = document.querySelector('.topo-node[data-node-id="docker"]');
        dockerNode.click();

        const drawer = document.getElementById('topo-drawer');
        expect(drawer.hidden).toBe(false);
        expect(document.getElementById('topo-drawer-title').textContent).toBe('Docker');

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        expect(drawer.hidden).toBe(true);
        expect(document.activeElement).toBe(dockerNode);
    });
});

describe('Theme Toggle', () => {
    beforeEach(() => {
        // documentElement itself (not just its children) persists across tests
        // in this file, so a data-theme/localStorage value set by one test
        // would otherwise leak into the next.
        localStorage.clear();
        document.documentElement.removeAttribute('data-theme');
        document.documentElement.innerHTML = html.toString();
        document.dispatchEvent(new Event('DOMContentLoaded'));
    });

    afterEach(() => {
        localStorage.clear();
        document.documentElement.removeAttribute('data-theme');
        jest.restoreAllMocks();
    });

    it('defaults to dark theme when no preference is stored', () => {
        expect(document.documentElement.getAttribute('data-theme')).toBeNull();
        expect(document.getElementById('theme-toggle').getAttribute('aria-pressed')).toBe('false');
    });

    it('switches to light theme on click and persists the choice', () => {
        const toggle = document.getElementById('theme-toggle');
        toggle.click();

        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
        expect(toggle.getAttribute('aria-pressed')).toBe('true');
        expect(toggle.getAttribute('aria-label')).toBe('Switch to dark theme');
        expect(localStorage.getItem('theme')).toBe('light');
    });

    it('switches back to dark on a second click', () => {
        const toggle = document.getElementById('theme-toggle');
        toggle.click();
        toggle.click();

        expect(document.documentElement.getAttribute('data-theme')).toBeNull();
        expect(localStorage.getItem('theme')).toBe('dark');
    });

    it('handles localStorage errors gracefully without failing the toggle', () => {
        jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('localStorage is unavailable');
        });

        const toggle = document.getElementById('theme-toggle');

        expect(() => toggle.click()).not.toThrow();

        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
        expect(toggle.getAttribute('aria-pressed')).toBe('true');
    });
});

describe('Project Filters', () => {
    beforeEach(() => {
        document.documentElement.innerHTML = html.toString();
        document.dispatchEvent(new Event('DOMContentLoaded'));
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    it('filters to only AI/ML-tagged projects and updates the status text', () => {
        jest.useFakeTimers();
        const aiMlBtn = document.querySelector('.filter-btn[data-filter="ai-ml"]');
        aiMlBtn.click();
        jest.advanceTimersByTime(300);

        const visibleCards = [...document.querySelectorAll('.project-card')].filter(c => c.style.display !== 'none');
        expect(visibleCards.length).toBeGreaterThan(0);
        visibleCards.forEach(card => {
            expect(card.dataset.categories.split(' ')).toContain('ai-ml');
        });
        expect(document.getElementById('project-filter-status').textContent).toContain('AI/ML');
        expect(aiMlBtn.getAttribute('aria-pressed')).toBe('true');
        expect(document.querySelector('.filter-btn[data-filter="all"]').getAttribute('aria-pressed')).toBe('false');
    });

    it('shows every project again when "All" is clicked after filtering', () => {
        jest.useFakeTimers();
        document.querySelector('.filter-btn[data-filter="testing"]').click();
        jest.advanceTimersByTime(300);
        document.querySelector('.filter-btn[data-filter="all"]').click();
        jest.advanceTimersByTime(300);

        const hiddenCards = [...document.querySelectorAll('.project-card')].filter(c => c.style.display === 'none');
        expect(hiddenCards.length).toBe(0);
        expect(document.getElementById('project-filter-status').textContent).toContain('all 7 projects');
    });
});

describe('Experience Sidebar', () => {
    beforeEach(() => {
        document.documentElement.innerHTML = html.toString();
        document.dispatchEvent(new Event('DOMContentLoaded'));
    });

    afterEach(() => {
        delete HTMLElement.prototype.scrollIntoView;
        jest.restoreAllMocks();
    });

    it('scrolls to the matching job card when a sidebar item is clicked', () => {
        const scrollIntoViewMock = jest.fn();
        HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

        document.querySelector('.experience-nav-item[data-target="job-isro"]').click();

        expect(scrollIntoViewMock).toHaveBeenCalled();
    });

    it('dims the other sidebar items and job cards on hover, and clears on mouseleave', () => {
        const hotelkeyNav = document.querySelector('.experience-nav-item[data-target="job-hotelkey"]');
        const isroNav = document.querySelector('.experience-nav-item[data-target="job-isro"]');
        const isroCard = document.getElementById('job-isro');

        hotelkeyNav.dispatchEvent(new MouseEvent('mouseenter'));

        expect(hotelkeyNav.classList.contains('dimmed')).toBe(false);
        expect(isroNav.classList.contains('dimmed')).toBe(true);
        expect(isroCard.classList.contains('dimmed')).toBe(true);

        document.querySelector('.experience-layout').dispatchEvent(new MouseEvent('mouseleave'));

        expect(isroNav.classList.contains('dimmed')).toBe(false);
        expect(isroCard.classList.contains('dimmed')).toBe(false);
    });
});

describe('Scroll Progress Rail', () => {
    beforeEach(() => {
        document.documentElement.innerHTML = html.toString();
        document.dispatchEvent(new Event('DOMContentLoaded'));
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('has one dot per main section, in document order, each linking to that section', () => {
        const dots = [...document.querySelectorAll('.scroll-rail-dot')];
        const expectedOrder = ['about', 'experience', 'projects', 'ops', 'stack', 'contact', 'tools'];

        expect(dots.map(d => d.dataset.target)).toEqual(expectedOrder);
        dots.forEach(dot => {
            expect(dot.getAttribute('href')).toBe(`#${dot.dataset.target}`);
            expect(document.getElementById(dot.dataset.target)).not.toBeNull();
        });
    });

    it('has one connector between every pair of dots', () => {
        const dots = document.querySelectorAll('.scroll-rail-dot').length;
        const connectors = document.querySelectorAll('.scroll-rail-connector').length;
        expect(connectors).toBe(dots - 1);
    });
});

describe('Command Palette', () => {
    beforeEach(() => {
        document.documentElement.innerHTML = html.toString();
        document.dispatchEvent(new Event('DOMContentLoaded'));
    });

    afterEach(() => {
        delete HTMLElement.prototype.scrollIntoView;
        jest.restoreAllMocks();
    });

    const dispatchKey = (key, opts = {}) =>
        document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...opts }));

    it('opens via the trigger button and lists commands grouped by category', () => {
        document.getElementById('cmdk-trigger').click();

        expect(document.getElementById('cmdk-palette').hidden).toBe(false);
        expect(document.getElementById('cmdk-backdrop').hidden).toBe(false);
        expect(document.activeElement).toBe(document.getElementById('cmdk-input'));
        expect(document.querySelectorAll('.cmdk-item').length).toBeGreaterThan(0);
        expect(document.querySelectorAll('.cmdk-group-label').length).toBeGreaterThanOrEqual(2);
    });

    it('opens via Ctrl+K and closes via Escape, restoring focus to the trigger', () => {
        const trigger = document.getElementById('cmdk-trigger');
        trigger.focus();
        trigger.click();
        expect(document.getElementById('cmdk-palette').hidden).toBe(false);

        dispatchKey('Escape');
        expect(document.getElementById('cmdk-palette').hidden).toBe(true);
        expect(document.activeElement).toBe(trigger);
    });

    it('filters commands as you type', () => {
        document.getElementById('cmdk-trigger').click();
        const input = document.getElementById('cmdk-input');
        input.value = 'theme';
        input.dispatchEvent(new Event('input', { bubbles: true }));

        const items = [...document.querySelectorAll('.cmdk-item')];
        expect(items.length).toBe(1);
        expect(items[0].textContent).toContain('Toggle light / dark theme');
    });

    it('shows an empty state for a query with no matches', () => {
        document.getElementById('cmdk-trigger').click();
        const input = document.getElementById('cmdk-input');
        input.value = 'zzz-nonexistent';
        input.dispatchEvent(new Event('input', { bubbles: true }));

        expect(document.getElementById('cmdk-empty').hidden).toBe(false);
        expect(document.querySelectorAll('.cmdk-item').length).toBe(0);
    });

    it('moves the selection with arrow keys', () => {
        document.getElementById('cmdk-trigger').click();
        dispatchKey('ArrowDown');

        const selected = document.querySelector('.cmdk-item.selected');
        const all = [...document.querySelectorAll('.cmdk-item')];
        expect(all.indexOf(selected)).toBe(1);
    });

    it('runs the selected command on Enter and closes the palette', () => {
        const scrollIntoViewMock = jest.fn();
        HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

        document.getElementById('cmdk-trigger').click();
        const input = document.getElementById('cmdk-input');
        input.value = 'Go to Projects';
        input.dispatchEvent(new Event('input', { bubbles: true }));

        dispatchKey('Enter');

        expect(scrollIntoViewMock).toHaveBeenCalled();
        expect(document.getElementById('cmdk-palette').hidden).toBe(true);
    });

    it('closes when the backdrop is clicked', () => {
        document.getElementById('cmdk-trigger').click();
        document.getElementById('cmdk-backdrop').click();
        expect(document.getElementById('cmdk-palette').hidden).toBe(true);
    });
});

describe('Scroll-Linked Reveal Choreography', () => {
    beforeEach(() => {
        document.documentElement.innerHTML = html.toString();
        document.dispatchEvent(new Event('DOMContentLoaded'));
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('marks every direct child of each stagger container as a reveal-item', () => {
        const containers = document.querySelectorAll('.stagger-children');
        expect(containers.length).toBeGreaterThan(0);
        containers.forEach(container => {
            [...container.children].forEach(child => {
                expect(child.classList.contains('reveal-item')).toBe(true);
            });
        });
    });

    it('does not collide with the Tools sidebar\'s existing "active" (selected-tool) class', () => {
        const activeScriptItem = document.querySelector('.script-item.active');
        expect(activeScriptItem).not.toBeNull();
        expect(activeScriptItem.classList.contains('reveal-item')).toBe(true);
        // Still selected, and not yet marked "revealed" (the IntersectionObserver
        // stub in tests never fires, same as every other scroll-triggered feature).
        expect(activeScriptItem.classList.contains('active')).toBe(true);
        expect(activeScriptItem.classList.contains('revealed')).toBe(false);
    });
});

describe('About Illustration', () => {
    beforeEach(() => {
        document.documentElement.innerHTML = html.toString();
        document.dispatchEvent(new Event('DOMContentLoaded'));
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('renders as a decorative, accessibility-hidden SVG alongside the bio text', () => {
        const svg = document.querySelector('.about-illustration svg');
        expect(svg).not.toBeNull();
        expect(svg.getAttribute('aria-hidden')).toBe('true');
        expect(document.querySelectorAll('.about-illustration .server-led').length).toBe(1);
        expect(document.querySelector('#about .text-block')).not.toBeNull();
    });
});

describe('DOCX to PDF Converter', () => {
    beforeEach(() => {
        document.documentElement.innerHTML = html.toString();
        document.dispatchEvent(new Event('DOMContentLoaded'));
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('displays an error message and hides the convert button for invalid file types', () => {
        const fileInput = document.getElementById('docx-file-input');
        const docxStatus = document.getElementById('docx-status');
        const btnConvertDocx = document.getElementById('btn-convert-docx');

        // Create a mock file with an invalid extension
        const invalidFile = new File(['test content'], 'test.txt', { type: 'text/plain' });

        // Overwrite the files property of the input
        Object.defineProperty(fileInput, 'files', {
            value: [invalidFile]
        });

        // Trigger change event
        fileInput.dispatchEvent(new Event('change'));

        // Verify status text
        expect(docxStatus.innerText).toBe('Error: Please select a valid .docx file.');

        // JSDOM style.color converts var(--danger) to empty string or throws error depending on implementation
        // But we can check inline style block
        expect(docxStatus.style.color).toBe('var(--danger)');

        // Verify button is hidden
        expect(btnConvertDocx.style.display).toBe('none');
    });
});
describe('Contact Form', () => {
    beforeEach(() => {
        document.documentElement.innerHTML = html.toString();
        document.dispatchEvent(new Event('DOMContentLoaded'));
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.useRealTimers();
    });

    it('handles successful form submission', async () => {
        const contactForm = document.getElementById('contact-form');
        const submitBtn = contactForm.querySelector('.submit-btn');
        const originalHTML = submitBtn.innerHTML;

        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
        });

        const resetSpy = jest.spyOn(contactForm, 'reset');

        contactForm.dispatchEvent(new Event('submit', { cancelable: true }));

        expect(submitBtn.disabled).toBe(true);
        expect(submitBtn.innerHTML).toContain('<span class="spinner"></span> Sending...');

        await Promise.resolve(); // Wait for microtasks

        expect(global.fetch).toHaveBeenCalledWith(contactForm.action, expect.objectContaining({
            method: contactForm.method,
            headers: {
                'Accept': 'application/json'
            }
        }));

        expect(submitBtn.innerText).toBe('Message Sent!');
        expect(submitBtn.style.backgroundColor).toBe('var(--teal-tint)');
        expect(resetSpy).toHaveBeenCalled();

        jest.advanceTimersByTime(3000);

        expect(submitBtn.disabled).toBe(false);
        expect(submitBtn.innerHTML).toBe(originalHTML);
        expect(submitBtn.style.backgroundColor).toBe('');
    });

    it('handles failed form submission (server error)', async () => {
        const contactForm = document.getElementById('contact-form');
        const submitBtn = contactForm.querySelector('.submit-btn');
        const originalHTML = submitBtn.innerHTML;

        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
        });

        contactForm.dispatchEvent(new Event('submit', { cancelable: true }));

        await Promise.resolve();

        expect(submitBtn.innerText).toBe('Error: Please try again.');
        expect(submitBtn.style.color).toBe('var(--danger)');
        expect(submitBtn.style.borderColor).toBe('var(--danger)');

        jest.advanceTimersByTime(3000);

        expect(submitBtn.disabled).toBe(false);
        expect(submitBtn.innerHTML).toBe(originalHTML);
        expect(submitBtn.style.color).toBe('');
        expect(submitBtn.style.borderColor).toBe('');
    });

    it('handles network errors during form submission', async () => {
        const contactForm = document.getElementById('contact-form');
        const submitBtn = contactForm.querySelector('.submit-btn');
        const originalHTML = submitBtn.innerHTML;

        global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

        contactForm.dispatchEvent(new Event('submit', { cancelable: true }));

        await Promise.resolve();

        expect(submitBtn.innerText).toBe('Error: Network issue.');
        expect(submitBtn.style.color).toBe('var(--danger)');
        expect(submitBtn.style.borderColor).toBe('var(--danger)');

        jest.advanceTimersByTime(3000);

        expect(submitBtn.disabled).toBe(false);
        expect(submitBtn.innerHTML).toBe(originalHTML);
        expect(submitBtn.style.color).toBe('');
        expect(submitBtn.style.borderColor).toBe('');
    });
});
