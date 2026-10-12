import { jest } from '@jest/globals';
import { initUIEffects } from './ui-effects.js';

describe('ui-effects.js', () => {
    let intersectionObservers = [];
    let originalRAF;

    beforeEach(() => {
        jest.useFakeTimers();

        // Mock requestAnimationFrame for throttle
        originalRAF = global.requestAnimationFrame;
        global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 0));

        // Mock matchMedia to match pointer: fine
        window.matchMedia = jest.fn().mockImplementation(query => ({
            matches: query === '(pointer: fine)',
        }));

        // Mock IntersectionObserver to capture callbacks
        intersectionObservers = [];
        global.IntersectionObserver = class {
            constructor(callback, options) {
                this.callback = callback;
                this.options = options;
                this.observed = [];
                intersectionObservers.push(this);
            }
            observe(element) {
                this.observed.push(element);
            }
            unobserve(element) {
                this.observed = this.observed.filter(e => e !== element);
            }
            disconnect() {
                this.observed = [];
            }

            // Helper to trigger intersection
            trigger(entries) {
                this.callback(entries, this);
            }
        };

        // Setup DOM
        document.body.innerHTML = `
            <div id="spotlight"></div>
            <div id="hero" style="height: 500px;"></div>
            <nav id="navbar"></nav>

            <section id="section1"></section>
            <section id="section2"></section>

            <a href="#section1" class="nav-link">Section 1</a>
            <a href="#section2" class="nav-link">Section 2</a>

            <div id="side-social"></div>
            <div id="side-email"></div>

            <div id="scroll-rail"></div>
            <div class="scroll-rail-dot" data-target="section1"></div>
            <div class="scroll-rail-dot" data-target="section2"></div>
            <div class="scroll-rail-connector"></div>

            <div class="reveal"></div>

            <div class="stagger-children">
                <div></div>
                <div></div>
            </div>

            <div class="project-card"></div>

            <div class="skill-bar" data-target="80">
                <div class="skill-bar-fill"></div>
            </div>
        `;

        // Mock offset properties
        Object.defineProperty(HTMLElement.prototype, 'offsetTop', { configurable: true, value: 0 });
        Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, value: 500 });
        Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, value: 500 });

        // Special case for section2 to be lower
        const section2 = document.getElementById('section2');
        if (section2) {
            Object.defineProperty(section2, 'offsetTop', { configurable: true, value: 500 });
        }

        // Special case for project card rect
        const card = document.querySelector('.project-card');
        if (card) {
            card.getBoundingClientRect = jest.fn(() => ({
                top: 100,
                left: 100,
                width: 200,
                height: 200
            }));
        }
    });

    afterEach(() => {
        jest.useRealTimers();
        global.requestAnimationFrame = originalRAF;
        document.body.innerHTML = '';
        jest.restoreAllMocks();
    });

    test('spotlight effect applies gradient on mousemove', () => {
        initUIEffects();
        const spotlight = document.getElementById('spotlight');

        document.dispatchEvent(new MouseEvent('mousemove', { clientX: 200, clientY: 300 }));
        jest.runAllTimers();

        expect(spotlight.style.background).toContain('circle at 200px 300px');
    });

    test('navbar scroll effect applies box-shadow and height', () => {
        initUIEffects();
        const navbar = document.getElementById('navbar');

        // Scroll > 50
        window.scrollY = 100;
        window.dispatchEvent(new Event('scroll'));
        jest.runAllTimers();

        expect(navbar.style.boxShadow).toBe('0 10px 30px -10px rgba(0, 0, 0, 0.7)');
        expect(navbar.style.height).toBe('70px');

        // Scroll <= 50
        window.scrollY = 20;
        window.dispatchEvent(new Event('scroll'));
        jest.runAllTimers();

        expect(navbar.style.boxShadow).toBe('none');
        expect(navbar.style.height).toBe('80px');
    });

    test('navbar scroll spy logic activates nav links and rail dots', () => {
        initUIEffects();

        // Trigger resize to update cache
        window.dispatchEvent(new Event('resize'));
        jest.runAllTimers();

        // Scroll to section 1
        window.scrollY = 100; // section1 top is 0, height 500
        window.dispatchEvent(new Event('scroll'));
        jest.runAllTimers();

        const navLinks = document.querySelectorAll('.nav-link');
        expect(navLinks[0].classList.contains('active')).toBe(true);
        expect(navLinks[1].classList.contains('active')).toBe(false);

        // Scroll to section 2
        window.scrollY = 600; // section2 top is 500
        window.dispatchEvent(new Event('scroll'));
        jest.runAllTimers();

        expect(navLinks[0].classList.contains('active')).toBe(false);
        expect(navLinks[1].classList.contains('active')).toBe(true);

        // Side social visibility
        const sideSocial = document.getElementById('side-social');
        expect(sideSocial.classList.contains('visible')).toBe(true); // scrolled past hero (500 - 200)
    });

    test('reveal intersection observer adds active class', () => {
        initUIEffects();
        const reveal = document.querySelector('.reveal');

        // Find reveal observer (it should be the first one created in initUIEffects for elements)
        // Wait, multiple observers are created: reveal, stagger, skill-bar
        const observer = intersectionObservers.find(obs => obs.observed.includes(reveal));

        observer.trigger([{ isIntersecting: true, target: reveal }]);

        expect(reveal.classList.contains('active')).toBe(true);
        expect(observer.observed).not.toContain(reveal); // unobserved
    });

    test('stagger-children observer adds revealed class to children with delay', () => {
        initUIEffects();
        const staggerContainer = document.querySelector('.stagger-children');
        const children = staggerContainer.children;

        expect(children[0].classList.contains('reveal-item')).toBe(true);

        const observer = intersectionObservers.find(obs => obs.observed.includes(staggerContainer));

        observer.trigger([{ isIntersecting: true, target: staggerContainer }]);

        // Fast forward first timeout (index * 90 = 0)
        jest.advanceTimersByTime(0);
        expect(children[0].classList.contains('revealed')).toBe(true);
        expect(children[1].classList.contains('revealed')).toBe(false);

        // Fast forward second timeout (index * 90 = 90)
        jest.advanceTimersByTime(90);
        expect(children[1].classList.contains('revealed')).toBe(true);
    });

    test('project card applies 3D transform on mousemove', () => {
        initUIEffects();
        const card = document.querySelector('.project-card');

        // Trigger mouseenter to cache rect
        card.dispatchEvent(new Event('mouseenter'));

        // Trigger mousemove
        card.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 150 }));
        jest.runAllTimers();

        expect(card.style.transform).toContain('perspective(1000px)');
        expect(card.style.transform).toContain('rotateX(');
        expect(card.style.transform).toContain('rotateY(');

        // Trigger mouseleave
        card.dispatchEvent(new Event('mouseleave'));
        expect(card.style.transform).toBe('perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)');
    });

    test('skill bar observer updates fill width', () => {
        initUIEffects();
        const skillBar = document.querySelector('.skill-bar');
        const fill = skillBar.querySelector('.skill-bar-fill');

        const observer = intersectionObservers.find(obs => obs.observed.includes(skillBar));

        observer.trigger([{ isIntersecting: true, target: skillBar }]);

        expect(fill.style.width).toBe('80%');
        expect(observer.observed).not.toContain(skillBar);
    });
});
