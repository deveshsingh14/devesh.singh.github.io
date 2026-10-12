import { jest } from '@jest/globals';
import { initProjects } from './projects.js';

describe('initProjects', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div>
                <button class="filter-btn active" data-filter="all" aria-pressed="true">All</button>
                <button class="filter-btn" data-filter="cloud" aria-pressed="false">Cloud</button>
                <button class="filter-btn" data-filter="ci-cd" aria-pressed="false">CI/CD</button>
            </div>
            <p id="project-filter-status"></p>
            <div>
                <div class="project-card" id="project-1" data-categories="cloud"></div>
                <div class="project-card" id="project-2" data-categories="ci-cd"></div>
                <div class="project-card" id="project-3" data-categories="cloud ci-cd"></div>
            </div>
        `;
        global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 0));
        jest.useFakeTimers();
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.useRealTimers();
    });

    test('initializes projects and caches categories', () => {
        initProjects();
        const cards = document.querySelectorAll('.project-card');
        expect(cards[0]._cachedCategories).toEqual(['cloud']);
        expect(cards[1]._cachedCategories).toEqual(['ci-cd']);
        expect(cards[2]._cachedCategories).toEqual(['cloud', 'ci-cd']);
    });

    test('filters projects correctly on button click', () => {
        initProjects();
        const cloudBtn = document.querySelector('[data-filter="cloud"]');
        cloudBtn.click();

        // Check button state
        expect(cloudBtn.classList.contains('active')).toBe(true);
        expect(cloudBtn.getAttribute('aria-pressed')).toBe('true');
        const allBtn = document.querySelector('[data-filter="all"]');
        expect(allBtn.classList.contains('active')).toBe(false);

        // Check status text
        const status = document.getElementById('project-filter-status');
        expect(status.textContent).toBe('Showing 2 projects tagged "Cloud".');

        // Check cards visibility logic
        const cards = document.querySelectorAll('.project-card');

        // Card 1 matches (cloud)
        expect(cards[0].style.display).toBe('');

        // Card 2 does not match (ci-cd)
        expect(cards[1].classList.contains('project-filtered-out')).toBe(true);
        jest.advanceTimersByTime(250);
        expect(cards[1].style.display).toBe('none');

        // Card 3 matches (cloud ci-cd)
        expect(cards[2].style.display).toBe('');
    });

    test('does nothing if missing elements', () => {
        document.body.innerHTML = '';
        expect(() => initProjects()).not.toThrow();
    });
});
