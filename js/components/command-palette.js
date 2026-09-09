export function initCommandPalette() {
    const cmdkTrigger = document.getElementById('cmdk-trigger');
    const cmdkBackdrop = document.getElementById('cmdk-backdrop');
    const cmdkPalette = document.getElementById('cmdk-palette');
    const cmdkInput = document.getElementById('cmdk-input');
    const cmdkResults = document.getElementById('cmdk-results');
    const cmdkEmpty = document.getElementById('cmdk-empty');

    if (cmdkTrigger && cmdkBackdrop && cmdkPalette && cmdkInput && cmdkResults && cmdkEmpty) {
        const scrollToSection = (id) => {
            const target = document.getElementById(id);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                target.focus({ preventScroll: true });
            }
        };

        const focusHeroTerminal = () => {
            const heroTerminalInput = document.getElementById('hero-term-input');
            if (heroTerminalInput) {
                heroTerminalInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                heroTerminalInput.focus();
            }
        };

        const themeToggle = document.getElementById('theme-toggle');

        const PALETTE_COMMANDS = [
            { id: 'nav-about', group: 'Navigate', label: 'Go to About', run: () => scrollToSection('about') },
            { id: 'nav-experience', group: 'Navigate', label: 'Go to Experience', run: () => scrollToSection('experience') },
            { id: 'nav-projects', group: 'Navigate', label: 'Go to Projects', run: () => scrollToSection('projects') },
            { id: 'nav-ops', group: 'Navigate', label: 'Go to Ops Dashboard', run: () => scrollToSection('ops') },
            { id: 'nav-stack', group: 'Navigate', label: 'Go to Infrastructure Map', run: () => scrollToSection('stack') },
            { id: 'nav-contact', group: 'Navigate', label: 'Go to Contact', run: () => scrollToSection('contact') },
            { id: 'nav-tools', group: 'Navigate', label: 'Go to Tools', run: () => scrollToSection('tools') },
            { id: 'action-theme', group: 'Actions', label: 'Toggle light / dark theme', run: () => themeToggle && themeToggle.click() },
            { id: 'action-pipeline', group: 'Actions', label: 'Run CI/CD pipeline simulation', run: () => {
                scrollToSection('ops');
                const btn = document.getElementById('run-pipeline');
                if (btn) btn.click();
            } },
            { id: 'action-terminal', group: 'Actions', label: 'Focus the portfolio terminal', run: focusHeroTerminal },
            { id: 'action-copy-email', group: 'Actions', label: 'Copy email address', run: () => {
                navigator.clipboard.writeText('devesh141singh@gmail.com').catch(() => {});
            } },
            { id: 'action-github', group: 'Actions', label: 'Open GitHub profile', run: () => window.open('https://github.com/deveshsingh14', '_blank', 'noopener') },
            { id: 'action-linkedin', group: 'Actions', label: 'Open LinkedIn profile', run: () => window.open('https://www.linkedin.com/in/devesh-s-4ab189263', '_blank', 'noopener') },
            { id: 'action-email', group: 'Actions', label: 'Send an email', run: () => { window.location.href = 'mailto:devesh141singh@gmail.com'; } }
        ];

        let filteredCommands = PALETTE_COMMANDS.slice();
        let selectedIndex = 0;
        let lastFocusedBeforePalette = null;

        const runCommand = (cmd) => {
            closePalette();
            cmd.run();
        };

        const renderResults = () => {
            cmdkResults.innerHTML = '';
            if (!filteredCommands.length) {
                cmdkEmpty.hidden = false;
                cmdkInput.removeAttribute('aria-activedescendant');
                return;
            }
            cmdkEmpty.hidden = true;

            let currentGroup = null;
            filteredCommands.forEach((cmd, index) => {
                if (cmd.group !== currentGroup) {
                    currentGroup = cmd.group;
                    const groupLabel = document.createElement('li');
                    groupLabel.className = 'cmdk-group-label';
                    groupLabel.setAttribute('role', 'presentation');
                    groupLabel.textContent = currentGroup;
                    cmdkResults.appendChild(groupLabel);
                }

                const item = document.createElement('li');
                item.className = 'cmdk-item' + (index === selectedIndex ? ' selected' : '');
                item.id = `cmdk-item-${cmd.id}`;
                item.setAttribute('role', 'option');
                item.setAttribute('aria-selected', index === selectedIndex ? 'true' : 'false');
                item.innerHTML = `<span>${cmd.label}</span><span class="cmdk-item-hint" aria-hidden="true">${cmd.group === 'Navigate' ? '↵ Jump' : '↵ Run'}</span>`;
                item.addEventListener('mouseenter', () => {
                    selectedIndex = index;
                    renderResults();
                });
                item.addEventListener('click', () => runCommand(cmd));
                cmdkResults.appendChild(item);
            });

            const activeItem = cmdkResults.querySelector('.cmdk-item.selected');
            if (activeItem) cmdkInput.setAttribute('aria-activedescendant', activeItem.id);
        };

        const filterCommands = () => {
            const query = cmdkInput.value.trim().toLowerCase();
            filteredCommands = query
                ? PALETTE_COMMANDS.filter(cmd => cmd.label.toLowerCase().includes(query))
                : PALETTE_COMMANDS.slice();
            selectedIndex = 0;
            renderResults();
        };

        function onPaletteKeydown(e) {
            if (e.key === 'Escape') {
                e.preventDefault();
                closePalette();
            } else if (e.key === 'Tab') {
                // The palette only ever has one focusable control (the input);
                // arrow keys drive selection, so keep focus from leaving it.
                e.preventDefault();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (filteredCommands.length) {
                    selectedIndex = (selectedIndex + 1) % filteredCommands.length;
                    renderResults();
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (filteredCommands.length) {
                    selectedIndex = (selectedIndex - 1 + filteredCommands.length) % filteredCommands.length;
                    renderResults();
                }
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const cmd = filteredCommands[selectedIndex];
                if (cmd) runCommand(cmd);
            }
        }

        function openPalette() {
            lastFocusedBeforePalette = document.activeElement;
            cmdkBackdrop.hidden = false;
            cmdkPalette.hidden = false;
            cmdkInput.value = '';
            filterCommands();
            cmdkInput.focus();
            document.addEventListener('keydown', onPaletteKeydown);
        }

        function closePalette() {
            cmdkBackdrop.hidden = true;
            cmdkPalette.hidden = true;
            document.removeEventListener('keydown', onPaletteKeydown);
            if (lastFocusedBeforePalette && typeof lastFocusedBeforePalette.focus === 'function') {
                lastFocusedBeforePalette.focus();
            }
        }

        cmdkTrigger.addEventListener('click', openPalette);
        cmdkBackdrop.addEventListener('click', closePalette);
        cmdkInput.addEventListener('input', filterCommands);

        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                if (cmdkPalette.hidden) {
                    openPalette();
                } else {
                    closePalette();
                }
            }
        });
    }
}
document.addEventListener('DOMContentLoaded', initCommandPalette);
