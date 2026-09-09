export function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const applyTheme = (theme) => {
            if (theme === 'light') {
                document.documentElement.setAttribute('data-theme', 'light');
            } else {
                document.documentElement.removeAttribute('data-theme');
            }
            themeToggle.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
            themeToggle.setAttribute('aria-label', theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
            themeToggle.setAttribute('title', theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
        };

        themeToggle.addEventListener('click', () => {
            const isLight = document.documentElement.getAttribute('data-theme') === 'light';
            const nextTheme = isLight ? 'dark' : 'light';
            applyTheme(nextTheme);
            try {
                localStorage.setItem('theme', nextTheme);
            } catch (e) { /* localStorage unavailable (e.g. private mode) — theme just won't persist */ }
        });

        // Sync the button's a11y state with whatever the head-inline script already applied
        applyTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
    }
}
document.addEventListener('DOMContentLoaded', initTheme);
