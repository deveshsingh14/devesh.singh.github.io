export function initExperience() {
    const experienceNavItems = document.querySelectorAll('.experience-nav-item');
    const jobCards = document.querySelectorAll('.job-card');

    if (experienceNavItems.length && jobCards.length) {
        const navItemByTarget = {};
        experienceNavItems.forEach(item => { navItemByTarget[item.dataset.target] = item; });

        experienceNavItems.forEach(item => {
            item.addEventListener('click', () => {
                const target = document.getElementById(item.dataset.target);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    target.focus({ preventScroll: true });
                }
            });
        });

        const experienceScrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const navItem = navItemByTarget[entry.target.id];
                if (!navItem) return;
                experienceNavItems.forEach(item => {
                    item.classList.remove('active');
                    item.removeAttribute('aria-current');
                });
                navItem.classList.add('active');
                navItem.setAttribute('aria-current', 'true');
            });
        }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });

        jobCards.forEach(card => experienceScrollObserver.observe(card));

        const setExperienceHover = (targetId) => {
            experienceNavItems.forEach(item => {
                item.classList.toggle('dimmed', targetId !== null && item.dataset.target !== targetId);
            });
            jobCards.forEach(card => {
                card.classList.toggle('dimmed', targetId !== null && card.id !== targetId);
            });
        };

        experienceNavItems.forEach(item => {
            item.addEventListener('mouseenter', () => setExperienceHover(item.dataset.target));
            item.addEventListener('focus', () => setExperienceHover(item.dataset.target));
        });
        jobCards.forEach(card => {
            card.addEventListener('mouseenter', () => setExperienceHover(card.id));
        });

        const experienceLayout = document.querySelector('.experience-layout');
        if (experienceLayout) {
            experienceLayout.addEventListener('mouseleave', () => setExperienceHover(null));
            experienceLayout.addEventListener('focusout', (e) => {
                if (!experienceLayout.contains(e.relatedTarget)) setExperienceHover(null);
            });
        }
    }
}
document.addEventListener('DOMContentLoaded', initExperience);
