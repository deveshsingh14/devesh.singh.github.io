import { throttle } from '../utils/dom.js';

export function initUIEffects() {
    // Spotlight Effect
    const spotlight = document.getElementById('spotlight');
    const hero = document.getElementById('hero');

    // Only apply on non-touch devices
    if (window.matchMedia('(pointer: fine)').matches && spotlight) {
        document.addEventListener('mousemove', throttle((e) => {
            const x = e.clientX;
            const y = e.clientY;
            spotlight.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(255, 87, 49, 0.12), transparent 80%)`;
        }));
    }

    // Scroll Spy for Top Navigation
    const sections = document.querySelectorAll('section, header');
    const navLinks = document.querySelectorAll('.nav-link');
    const navbar = document.getElementById('navbar');
    const sideSocial = document.getElementById('side-social');
    const sideEmail = document.getElementById('side-email');
    const scrollRail = document.getElementById('scroll-rail');
    const railDots = document.querySelectorAll('.scroll-rail-dot');
    const railConnectors = document.querySelectorAll('.scroll-rail-connector');
    const RAIL_SECTION_ORDER = [...railDots].map(dot => dot.dataset.target);

    // Change navbar style on scroll
    if (navbar) {
        window.addEventListener('scroll', throttle(() => {
            const scrollY = window.scrollY;

            if (scrollY > 50) {
                navbar.style.boxShadow = '0 10px 30px -10px rgba(0, 0, 0, 0.7)';
                navbar.style.height = '70px';
            } else {
                navbar.style.boxShadow = 'none';
                navbar.style.height = '80px';
            }

            // Reveal the persistent social sidebars and scroll rail once the hero has scrolled by
            if (hero && sideSocial && sideEmail) {
                const pastHero = scrollY > hero.offsetHeight - 200;
                sideSocial.classList.toggle('visible', pastHero);
                sideEmail.classList.toggle('visible', pastHero);
                if (scrollRail) scrollRail.classList.toggle('visible', pastHero);
            }

            // Scroll spy logic
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (scrollY >= (sectionTop - sectionHeight / 3)) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
                if (link.getAttribute('href').includes(current)) {
                    link.classList.add('active');
                    link.setAttribute('aria-current', 'true');
                }
            });

            // Sync the scroll-progress rail's dots/connectors to the same current section
            const currentRailIndex = RAIL_SECTION_ORDER.indexOf(current);
            railDots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentRailIndex);
                dot.classList.toggle('visited', i < currentRailIndex);
            });
            railConnectors.forEach((connector, i) => {
                connector.classList.toggle('filled', i < currentRailIndex);
            });
        }));
    }

    // Fade-in Animation on Scroll
    const revealElements = document.querySelectorAll('.reveal');
    if (revealElements.length) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target); // Run once
                }
            });
        }, {
            root: null,
            rootMargin: '0px 0px -10% 0px',
            threshold: 0.1
        });

        revealElements.forEach(element => {
            revealObserver.observe(element);
        });
    }

    // Scroll-Linked Reveal Choreography
    const staggerContainers = document.querySelectorAll('.stagger-children');
    if (staggerContainers.length) {
        const STAGGER_STEP_MS = 90;
        const staggerObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                [...entry.target.children].forEach((child, index) => {
                    setTimeout(() => child.classList.add('revealed'), index * STAGGER_STEP_MS);
                });
                observer.unobserve(entry.target);
            });
        }, {
            root: null,
            rootMargin: '0px 0px -10% 0px',
            threshold: 0.15
        });

        staggerContainers.forEach(container => {
            [...container.children].forEach(child => child.classList.add('reveal-item'));
            staggerObserver.observe(container);
        });
    }

    // 3D Tilt Effect for Project Cards
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mousemove', throttle((e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        }));

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });

    // Animated Skill Bars
    const skillBars = document.querySelectorAll('.skill-bar');
    if (skillBars.length) {
        const skillBarObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const fill = entry.target.querySelector('.skill-bar-fill');
                    const target = entry.target.getAttribute('data-target');
                    if (fill && target) fill.style.width = `${target}%`;
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        skillBars.forEach(bar => skillBarObserver.observe(bar));
    }
}
document.addEventListener('DOMContentLoaded', initUIEffects);
