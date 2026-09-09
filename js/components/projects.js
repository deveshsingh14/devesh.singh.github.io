export function initProjects() {
    const projectCards = document.querySelectorAll('.project-card');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const filterStatus = document.getElementById('project-filter-status');

    if (filterButtons.length && filterStatus) {
        const FILTER_LABELS = { cloud: 'Cloud', 'ci-cd': 'CI/CD', 'ai-ml': 'AI/ML', testing: 'Testing' };

        const applyFilter = (filter) => {
            let visibleCount = 0;
            projectCards.forEach(card => {
                const categories = (card.dataset.categories || '').split(' ');
                const show = filter === 'all' || categories.includes(filter);
                if (show) visibleCount++;

                if (show) {
                    card.style.display = '';
                    requestAnimationFrame(() => card.classList.remove('project-filtered-out'));
                } else {
                    card.classList.add('project-filtered-out');
                    setTimeout(() => {
                        if (card.classList.contains('project-filtered-out')) card.style.display = 'none';
                    }, 250);
                }
            });

            filterStatus.textContent = filter === 'all'
                ? `Showing all ${visibleCount} projects.`
                : `Showing ${visibleCount} project${visibleCount === 1 ? '' : 's'} tagged "${FILTER_LABELS[filter]}".`;
        };

        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-pressed', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
                applyFilter(btn.dataset.filter);
            });
        });
    }
}
document.addEventListener('DOMContentLoaded', initProjects);
