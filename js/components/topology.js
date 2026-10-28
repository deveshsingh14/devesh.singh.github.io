export function initTopology() {
    const topoMap = document.getElementById('topo-map');
    const topoLines = document.getElementById('topo-lines');
    const topoDrawer = document.getElementById('topo-drawer');

    if (topoMap && topoLines && topoDrawer) {
        const TOPOLOGY_DATA = [
            { id: 'aws', label: 'AWS', category: 'hub', context: 'Used daily at HotelKey', achievements: [
                'Handle deployments, server operations, security and health checks on AWS at HotelKey.',
                'Completed HotelKey\'s internal AWS training: EC2, VPC, S3, RDS, IAM, CloudWatch and more.'
            ], projects: [] },
            { id: 'docker', label: 'Docker', category: 'containers', context: 'Used daily at HotelKey', achievements: [
                'Run containerized cron and scheduled jobs.'
            ], projects: [] },
            { id: 'kubernetes', label: 'Kubernetes', category: 'containers', context: 'Used daily at HotelKey', achievements: [
                'Manage clusters, environment configuration and workloads.',
                'Tail pod logs for live troubleshooting.'
            ], projects: [] },
            { id: 'terraform', label: 'Terraform', category: 'iac', context: 'Used at HotelKey (DevOps)', achievements: [
                'Prepare and review Terraform plans for infrastructure changes.'
            ], projects: [] },
            { id: 'jenkins', label: 'Jenkins', category: 'cicd', context: 'Core tool since 2025', achievements: [
                'Redesigned the Jenkins RBAC model: 70+ roles, 1,000+ users, least-privilege regex.',
                'Built a Python engine behind all read-only database jobs across environments.',
                'Built an MCP server exposing Jenkins operations to an LLM agent.'
            ], projects: ['project-mcp-jenkins'] },
            { id: 'argocd', label: 'ArgoCD', category: 'cicd', context: 'Used at HotelKey (DevOps)', achievements: [
                'Support GitOps deployments with ArgoCD.'
            ], projects: [] },
            { id: 'python', label: 'Python', category: 'lang', context: 'Primary language since college', achievements: [
                'Built automation, a sharded-MySQL query engine and validation tools at HotelKey.',
                'Processed weather radar data at ISRO; published an LSTM forecasting study.',
                'Built Playwright automation and a self-healing UI test framework.'
            ], projects: ['project-self-healing-ui', 'project-stock-lstm'] },
            { id: 'node-postgres', label: 'Node.js / PostgreSQL', category: 'app', context: 'Personal projects (2026)', achievements: [
                'Built and run a live e-commerce platform with Node.js, Express and PostgreSQL.',
                'Engineered a bulk CSV import pipeline with strict role-based access.'
            ], projects: ['project-rajeshwari'] },
            { id: 'observability', label: 'Grafana / Sentry', category: 'observability', context: 'Used daily at HotelKey', achievements: [
                'Monitor cloud operations with Grafana dashboards.',
                'Run Sentry error monitoring and structured logging on a live app.'
            ], projects: ['project-rajeshwari'] },
            { id: 'playwright', label: 'Playwright', category: 'testing', context: 'Used since 2025', achievements: [
                'Automated a nightly audit process and configuration flows at HotelKey.',
                'Built a self-healing UI test framework with an LLM agent.'
            ], projects: ['project-self-healing-ui'] }
        ];

        const CATEGORY_LABELS = {
            hub: 'Cloud Platform', containers: 'Containers', iac: 'Infrastructure as Code',
            cicd: 'CI/CD', lang: 'Language', app: 'Application Stack',
            observability: 'Observability', testing: 'Testing'
        };

        const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

        const computeRadialLayout = (nodes) => {
            const hub = nodes.find(n => n.category === 'hub');
            const spokes = nodes.filter(n => n.category !== 'hub');
            const layout = { [hub.id]: { xPct: 50, yPct: 50 } };
            const radius = 38;
            const angleStep = (2 * Math.PI) / spokes.length;
            spokes.forEach((node, i) => {
                const angle = -Math.PI / 2 + i * angleStep;
                const x = 50 + radius * Math.cos(angle) * 1.15;
                const y = 50 + radius * Math.sin(angle);
                layout[node.id] = { xPct: clamp(x, 8, 92), yPct: clamp(y, 10, 90) };
            });
            return layout;
        };

        const abbreviate = (label) => (label.replace(/[^a-zA-Z]/g, '').slice(0, 3) || label.slice(0, 3)).toUpperCase();

        const layout = computeRadialLayout(TOPOLOGY_DATA);
        const hubId = TOPOLOGY_DATA.find(n => n.category === 'hub').id;

        const linesFragment = document.createDocumentFragment();
        TOPOLOGY_DATA.forEach(node => {
            if (node.id === hubId) return;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', layout[hubId].xPct);
            line.setAttribute('y1', layout[hubId].yPct);
            line.setAttribute('x2', layout[node.id].xPct);
            line.setAttribute('y2', layout[node.id].yPct);
            linesFragment.appendChild(line);
        });
        topoLines.appendChild(linesFragment);

        const nodesFragment = document.createDocumentFragment();
        TOPOLOGY_DATA.forEach(node => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `topo-node category-${node.category}`;
            btn.style.left = `${layout[node.id].xPct}%`;
            btn.style.top = `${layout[node.id].yPct}%`;
            btn.setAttribute('aria-haspopup', 'dialog');
            btn.dataset.nodeId = node.id;

            const dotSpan = document.createElement('span');
            dotSpan.className = 'topo-node-dot';
            dotSpan.setAttribute('aria-hidden', 'true');
            dotSpan.textContent = abbreviate(node.label);

            const labelSpan = document.createElement('span');
            labelSpan.className = 'topo-node-label';
            labelSpan.textContent = node.label;

            btn.appendChild(dotSpan);
            btn.appendChild(labelSpan);

            btn.addEventListener('click', () => openTopoDrawer(node.id));
            nodesFragment.appendChild(btn);
        });
        topoMap.appendChild(nodesFragment);

        const drawerPanel = topoDrawer.querySelector('.topo-drawer-panel');
        const drawerBackdrop = document.getElementById('topo-drawer-backdrop');
        const drawerClose = document.getElementById('topo-drawer-close');
        const drawerCategory = document.getElementById('topo-drawer-category');
        const drawerTitle = document.getElementById('topo-drawer-title');
        const drawerYears = document.getElementById('topo-drawer-years');
        const drawerAchievements = document.getElementById('topo-drawer-achievements');
        const drawerProjects = document.getElementById('topo-drawer-projects');
        let lastFocusedNode = null;

        function onDrawerKeydown(e) {
            if (e.key === 'Escape') { closeTopoDrawer(); return; }
            if (e.key === 'Tab') {
                const focusables = drawerPanel.querySelectorAll('a, button');
                if (!focusables.length) return;
                const first = focusables[0];
                const last = focusables[focusables.length - 1];
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus({ preventScroll: true }); }
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus({ preventScroll: true }); }
            }
        }

        const projectTitleCache = {};

        // Pre-cache project titles during component initialization to avoid redundant DOM queries
        // in the openTopoDrawer event listener loop.
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach(card => {
            if (card.id) {
                const titleEl = card.querySelector('.project-title');
                if (titleEl) {
                    projectTitleCache[card.id] = titleEl.textContent;
                }
            }
        });

        function openTopoDrawer(nodeId) {
            const node = TOPOLOGY_DATA.find(n => n.id === nodeId);
            if (!node) return;
            lastFocusedNode = topoMap.querySelector(`.topo-node[data-node-id="${nodeId}"]`);
            drawerCategory.textContent = CATEGORY_LABELS[node.category] || node.category;
            drawerTitle.textContent = node.label;
            drawerYears.textContent = node.context;
            drawerAchievements.textContent = '';
            node.achievements.forEach(a => {
                const li = document.createElement('li');
                li.textContent = a;
                drawerAchievements.appendChild(li);
            });

            drawerProjects.textContent = '';

            const projectsHeading = drawerProjects.previousElementSibling;
            if (node.projects.length === 0) {
                projectsHeading.hidden = true;
                drawerProjects.hidden = true;
            } else {
                projectsHeading.hidden = false;
                drawerProjects.hidden = false;
                node.projects.forEach(pid => {
                    const li = document.createElement('li');
                    const aEl = document.createElement('a');
                    aEl.href = `#${pid}`;
                    aEl.textContent = projectTitleCache[pid] || pid;
                    li.appendChild(aEl);
                    drawerProjects.appendChild(li);
                });
            }

            topoDrawer.hidden = false;
            drawerPanel.focus({ preventScroll: true });
            document.addEventListener('keydown', onDrawerKeydown);
        }

        function closeTopoDrawer() {
            topoDrawer.hidden = true;
            document.removeEventListener('keydown', onDrawerKeydown);
            if (lastFocusedNode) lastFocusedNode.focus({ preventScroll: true });
        }

        drawerClose.addEventListener('click', closeTopoDrawer);
        drawerBackdrop.addEventListener('click', closeTopoDrawer);

        drawerProjects.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;
            const targetId = link.getAttribute('href').slice(1);
            closeTopoDrawer();
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                setTimeout(() => {
                    targetEl.classList.add('highlight-flash');
                    setTimeout(() => targetEl.classList.remove('highlight-flash'), 1700);
                }, 350);
            }
        });
    }
}
document.addEventListener('DOMContentLoaded', initTopology);
