import { escapeHtml, typeLines, prefersReducedMotion } from '../utils/dom.js';

export function initHeroTerminal() {
    const heroTermOutput = document.getElementById('hero-term-output');
    const heroTermInput = document.getElementById('hero-term-input');
    const heroTermGhost = document.getElementById('hero-term-ghost');
    const heroTermBody = document.getElementById('hero-term-body');
    const heroTerminalEl = document.querySelector('.hero-terminal');

    if (heroTermOutput && heroTermInput) {
        const PORTFOLIO_DATA = {
            skills: {
                'Languages': ['Python', 'JavaScript/Node.js', 'SQL', 'Bash'],
                'IaC & Containers': ['Docker', 'Kubernetes', 'Terraform', 'Helm'],
                'CI/CD': ['Jenkins', 'ArgoCD', 'GitOps', 'Bitbucket Pipelines'],
                'Cloud': ['AWS (EC2, EKS, S3, IAM)'],
                'Observability': ['Prometheus', 'Grafana', 'OpenTelemetry', 'SonarQube']
            },
            experience: [
                { dates: 'Jun 2025 – Present', title: 'DevOps Engineer', company: 'HotelKey India Pvt Ltd' },
                { dates: 'Jun 2024 – Dec 2024', title: 'Research Intern', company: 'ISRO' },
                { dates: 'May 2024 – Jun 2024', title: 'DL/NLP Intern', company: 'Codemate IT Services' }
            ],
            projects: [
                { name: 'Rajeshwari B2B E-Commerce & Management Portal', stack: 'Node.js, PostgreSQL, Prisma' },
                { name: 'MCP-Based AI Agent for Jenkins', stack: 'Python, MCP, Claude API' },
                { name: 'Self-Healing UI Test Framework', stack: 'Playwright, LLM' },
                { name: 'GitOps-Driven Kubernetes Platform', stack: 'Kubernetes, ArgoCD, Terraform' },
                { name: 'AI/ML Model Serving Infrastructure', stack: 'AWS EKS, KServe, MLOps' },
                { name: 'DevSecOps Pipeline & Observability Stack', stack: 'Prometheus, Grafana, SonarQube' }
            ],
            contact: {
                email: 'devesh141singh@gmail.com',
                github: 'https://github.com/deveshsingh14',
                linkedin: 'https://www.linkedin.com/in/devesh-s-4ab189263'
            }
        };

        const COMMAND_DESCRIPTIONS = {
            help: 'List available commands',
            whoami: 'Print current user info',
            skills: 'List technical skills',
            experience: 'Show work experience',
            projects: 'Show featured projects',
            contact: 'Show contact info',
            clear: 'Clear the terminal'
        };
        const TERMINAL_COMMANDS = Object.keys(COMMAND_DESCRIPTIONS);
        const COMPLETION_CANDIDATES = [...TERMINAL_COMMANDS, 'sudo'];

        let history = [];
        let historyIndex = -1;
        let tabMatches = [];
        let tabMatchIndex = 0;
        let lastTabValue = '';

        const echoCommand = (raw) => {
            const div = document.createElement('div');
            div.className = 'term-line';
            div.innerHTML = `<span style="color:var(--teal)" aria-hidden="true">guest@devesh:~$</span> ${escapeHtml(raw)}`;
            heroTermOutput.appendChild(div);
            heroTermOutput.scrollTop = heroTermOutput.scrollHeight;
        };

        const buildHelpLines = () => {
            const lines = [{ html: `<div class="term-line">Available commands:</div>`, delay: 120 }];
            TERMINAL_COMMANDS.forEach(cmd => {
                lines.push({ html: `<div class="term-line">&nbsp;&nbsp;<span style="color:var(--teal)">${cmd}</span> — ${COMMAND_DESCRIPTIONS[cmd]}</div>`, delay: 70 });
            });
            lines.push({ html: `<div class="term-line" style="color:var(--slate)">Tip: Tab to autocomplete, ↑/↓ to browse history.</div>`, delay: 120 });
            return lines;
        };

        const buildWhoamiLines = () => [
            { html: `<div class="term-line">devesh-singh-baish</div>`, delay: 120 },
            { html: `<div class="term-line">DevOps Engineer @ HotelKey India Pvt Ltd</div>`, delay: 120 },
            { html: `<div class="term-line">groups: aws, kubernetes, terraform, ci-cd, observability</div>`, delay: 120 }
        ];

        const buildSkillsLines = () => Object.entries(PORTFOLIO_DATA.skills).map(([category, items]) => ({
            html: `<div class="term-line"><span style="color:var(--teal)">${category}:</span> ${items.join(', ')}</div>`,
            delay: 120
        }));

        const buildExperienceLines = () => {
            const lines = PORTFOLIO_DATA.experience.map(job => ({
                html: `<div class="term-line">${job.dates} — <span style="color:var(--teal)">${job.title}</span> @ ${job.company}</div>`,
                delay: 120
            }));
            lines.push({ html: `<div class="term-line"><span aria-hidden="true">→</span> <a href="#experience">jump to full experience section</a></div>`, delay: 120 });
            return lines;
        };

        const buildProjectsLines = () => {
            const lines = PORTFOLIO_DATA.projects.map(p => ({
                html: `<div class="term-line"><span style="color:var(--teal)">${p.name}</span> — ${p.stack}</div>`,
                delay: 120
            }));
            lines.push({ html: `<div class="term-line"><span aria-hidden="true">→</span> <a href="#projects">jump to full projects section</a></div>`, delay: 120 });
            return lines;
        };

        const buildContactLines = () => {
            const c = PORTFOLIO_DATA.contact;
            return [
                { html: `<div class="term-line">email: <a href="mailto:${c.email}">${c.email}</a></div>`, delay: 120 },
                { html: `<div class="term-line">github: <a href="${c.github}" target="_blank" rel="noreferrer">${c.github}</a></div>`, delay: 120 },
                { html: `<div class="term-line">linkedin: <a href="${c.linkedin}" target="_blank" rel="noreferrer">${c.linkedin}</a></div>`, delay: 120 },
                { html: `<div class="term-line"><span aria-hidden="true">→</span> <a href="#contact">jump to contact form</a></div>`, delay: 120 }
            ];
        };

        const COMMAND_BUILDERS = {
            help: buildHelpLines,
            whoami: buildWhoamiLines,
            skills: buildSkillsLines,
            experience: buildExperienceLines,
            projects: buildProjectsLines,
            contact: buildContactLines
        };

        const triggerShake = () => {
            if (!heroTerminalEl || prefersReducedMotion()) return;
            heroTerminalEl.classList.add('shake');
            setTimeout(() => heroTerminalEl.classList.remove('shake'), 450);
        };

        const updateGhost = () => {
            const value = heroTermInput.value;
            if (!value) { heroTermGhost.textContent = ''; return; }
            const lower = value.toLowerCase();
            const match = COMPLETION_CANDIDATES.find(c => c !== lower && c.startsWith(lower));
            heroTermGhost.textContent = match ? value + match.slice(value.length) : '';
        };

        const runHeroCommand = (raw) => {
            const trimmed = raw.trim();
            echoCommand(raw);
            if (!trimmed) return;

            history.push(trimmed);
            historyIndex = history.length;

            const lower = trimmed.toLowerCase();

            if (lower === 'clear') { heroTermOutput.innerHTML = ''; return; }

            if (lower.startsWith('sudo rm -rf')) {
                typeLines([
                    { html: `<div class="term-line" style="color:var(--danger)">Permission denied: nice try.</div>`, delay: 250 },
                    { html: `<div class="term-line">This portfolio is protected by immutable infrastructure and a full off-site backup.</div>`, delay: 250 }
                ], heroTermOutput, null);
                triggerShake();
                return;
            }

            if (COMMAND_BUILDERS[lower]) {
                typeLines(COMMAND_BUILDERS[lower](), heroTermOutput, null);
            } else {
                typeLines([
                    { html: `<div class="term-line" style="color:var(--danger)">command not found: ${escapeHtml(trimmed)}</div>`, delay: 150 },
                    { html: `<div class="term-line" style="color:var(--slate)">Type 'help' for a list of commands.</div>`, delay: 120 }
                ], heroTermOutput, null);
            }
        };

        heroTermInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const value = heroTermInput.value;
                heroTermInput.value = '';
                heroTermGhost.textContent = '';
                lastTabValue = '';
                tabMatches = [];
                runHeroCommand(value);
            } else if (e.key === 'Tab') {
                e.preventDefault();
                const value = heroTermInput.value.trim().toLowerCase();
                if (!value) return;
                if (value !== lastTabValue) {
                    tabMatches = COMPLETION_CANDIDATES.filter(c => c.startsWith(value));
                    tabMatchIndex = 0;
                } else {
                    tabMatchIndex = tabMatches.length ? (tabMatchIndex + 1) % tabMatches.length : 0;
                }
                lastTabValue = value;
                if (tabMatches.length) {
                    heroTermInput.value = tabMatches[tabMatchIndex];
                    updateGhost();
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (!history.length) return;
                historyIndex = Math.max(0, historyIndex - 1);
                heroTermInput.value = history[historyIndex] || '';
                updateGhost();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (!history.length) return;
                historyIndex = Math.min(history.length, historyIndex + 1);
                heroTermInput.value = history[historyIndex] || '';
                updateGhost();
            }
        });

        heroTermInput.addEventListener('input', () => {
            lastTabValue = '';
            updateGhost();
        });

        if (heroTermBody) {
            heroTermBody.addEventListener('click', (e) => {
                if (e.target !== heroTermInput) heroTermInput.focus();
            });
        }

        typeLines([
            { html: `<div class="term-line">Welcome to Devesh's terminal. Booting profile…</div>`, delay: 350 },
            { html: `<div class="term-line">Connected as <span style="color:var(--teal)">guest</span>. Type <span style="color:var(--teal)">help</span> to see available commands.</div>`, delay: 250 }
        ], heroTermOutput, null);
    }
}
document.addEventListener('DOMContentLoaded', initHeroTerminal);
