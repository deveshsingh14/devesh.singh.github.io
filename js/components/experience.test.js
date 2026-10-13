import { jest } from '@jest/globals';
import { initExperience } from './experience.js';

describe('initExperience', () => {
    let mockObserve;
    let mockDisconnect;

    beforeEach(() => {
        document.body.innerHTML = `
            <div class="experience-layout">
                <button class="experience-nav-item active" data-target="job-1" aria-current="true">Job 1</button>
                <button class="experience-nav-item" data-target="job-2">Job 2</button>
                <div class="job-card" id="job-1" tabindex="-1"></div>
                <div class="job-card" id="job-2" tabindex="-1"></div>
            </div>
        `;

        mockObserve = jest.fn();
        mockDisconnect = jest.fn();

        global.IntersectionObserver = jest.fn().mockImplementation((callback) => {
            return {
                observe: mockObserve,
                disconnect: mockDisconnect,
                takeRecords: () => [],
                // Helper to trigger intersection logic in tests
                _trigger: (entries) => callback(entries)
            };
        });

        HTMLElement.prototype.scrollIntoView = jest.fn();
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
        delete global.IntersectionObserver;
    });

    test('does nothing if required elements are missing', () => {
        document.body.innerHTML = '';
        expect(() => initExperience()).not.toThrow();
        expect(global.IntersectionObserver).not.toHaveBeenCalled();
    });

    test('scrolls and focuses target on nav item click', () => {
        initExperience();

        const navItem = document.querySelector('[data-target="job-2"]');
        const targetCard = document.getElementById('job-2');

        const focusSpy = jest.spyOn(targetCard, 'focus');

        navItem.click();

        expect(targetCard.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
        expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });

        focusSpy.mockRestore();
    });

    test('updates active nav item when corresponding job card intersects', () => {
        initExperience();

        const observerInstance = global.IntersectionObserver.mock.results[0].value;
        const navItem1 = document.querySelector('[data-target="job-1"]');
        const navItem2 = document.querySelector('[data-target="job-2"]');
        const jobCard2 = document.getElementById('job-2');

        // Simulate scrolling down so job 2 intersects
        observerInstance._trigger([
            { isIntersecting: true, target: jobCard2 }
        ]);

        expect(navItem1.classList.contains('active')).toBe(false);
        expect(navItem1.hasAttribute('aria-current')).toBe(false);

        expect(navItem2.classList.contains('active')).toBe(true);
        expect(navItem2.getAttribute('aria-current')).toBe('true');
    });

    test('ignores intersection events that are not intersecting or target invalid id', () => {
        initExperience();

        const observerInstance = global.IntersectionObserver.mock.results[0].value;
        const navItem1 = document.querySelector('[data-target="job-1"]');
        const navItem2 = document.querySelector('[data-target="job-2"]');
        const jobCard2 = document.getElementById('job-2');

        // Simulate an event that is not intersecting
        observerInstance._trigger([
            { isIntersecting: false, target: jobCard2 }
        ]);

        // State should remain unchanged (job 1 active)
        expect(navItem1.classList.contains('active')).toBe(true);
        expect(navItem2.classList.contains('active')).toBe(false);

        // Simulate an event for an unknown target
        const dummyCard = document.createElement('div');
        dummyCard.id = 'job-unknown';
        observerInstance._trigger([
            { isIntersecting: true, target: dummyCard }
        ]);

        // State should remain unchanged
        expect(navItem1.classList.contains('active')).toBe(true);
    });

    test('toggles dimmed classes on nav items and job cards on nav item hover/focus', () => {
        initExperience();

        const navItem1 = document.querySelector('[data-target="job-1"]');
        const navItem2 = document.querySelector('[data-target="job-2"]');
        const jobCard1 = document.getElementById('job-1');
        const jobCard2 = document.getElementById('job-2');

        // Mouseenter navItem1
        navItem1.dispatchEvent(new Event('mouseenter'));

        expect(navItem1.classList.contains('dimmed')).toBe(false);
        expect(navItem2.classList.contains('dimmed')).toBe(true);
        expect(jobCard1.classList.contains('dimmed')).toBe(false);
        expect(jobCard2.classList.contains('dimmed')).toBe(true);

        // Focus navItem2
        navItem2.dispatchEvent(new Event('focus'));

        expect(navItem1.classList.contains('dimmed')).toBe(true);
        expect(navItem2.classList.contains('dimmed')).toBe(false);
        expect(jobCard1.classList.contains('dimmed')).toBe(true);
        expect(jobCard2.classList.contains('dimmed')).toBe(false);
    });

    test('toggles dimmed classes on job card hover', () => {
        initExperience();

        const navItem1 = document.querySelector('[data-target="job-1"]');
        const jobCard1 = document.getElementById('job-1');
        const jobCard2 = document.getElementById('job-2');

        // Mouseenter jobCard2
        jobCard2.dispatchEvent(new Event('mouseenter'));

        expect(navItem1.classList.contains('dimmed')).toBe(true);
        expect(jobCard1.classList.contains('dimmed')).toBe(true);
        expect(jobCard2.classList.contains('dimmed')).toBe(false);
    });

    test('resets dimmed states on layout mouseleave or focusout', () => {
        initExperience();

        const layout = document.querySelector('.experience-layout');
        const navItem1 = document.querySelector('[data-target="job-1"]');
        const jobCard2 = document.getElementById('job-2');

        // First dim something
        navItem1.dispatchEvent(new Event('mouseenter'));
        expect(jobCard2.classList.contains('dimmed')).toBe(true);

        // Mouseleave layout
        layout.dispatchEvent(new Event('mouseleave'));

        // Everything should be undimmed
        expect(document.querySelectorAll('.dimmed').length).toBe(0);

        // Dim again
        navItem1.dispatchEvent(new Event('mouseenter'));
        expect(jobCard2.classList.contains('dimmed')).toBe(true);

        // Focusout from layout to an element outside
        const outsideElement = document.createElement('div');
        document.body.appendChild(outsideElement);

        const focusOutEvent = new FocusEvent('focusout', {
            relatedTarget: outsideElement
        });
        layout.dispatchEvent(focusOutEvent);

        // Everything should be undimmed
        expect(document.querySelectorAll('.dimmed').length).toBe(0);
    });
});
