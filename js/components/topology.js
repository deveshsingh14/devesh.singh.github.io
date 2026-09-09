export function initTopology() {
    const topoMap = document.getElementById('topo-map');
    const topoLines = document.getElementById('topo-lines');
    const topoDrawer = document.getElementById('topo-drawer');

    if (topoMap && topoLines && topoDrawer) {
        const TOPOLOGY_DATA = [
            { id: 'aws', label: 'AWS', category: 'hub', years: '2+ yrs', achievements: [
                'Manage EC2/EKS/S3/IAM across HotelKey production infrastructure.',
                'Automated large-scale data injection with SQL sets on managed databases.',
                'Deployed KServe/Seldon Core model-serving workloads on an AWS EKS cluster.'
            ], projects: ['project-mlops-serving', 'project-gitops-k8s'] },
            { id: 'docker', label: 'Docker', category: 'containers', years: '3+ yrs', achievements: [
                'Containerized services for consistent builds across every environment.',
                'Authored multi-stage Dockerfiles to shrink image size and build time.'
            ], projects: ['project-mlops-serving'] },
            { id: 'kubernetes', label: 'Kubernetes', category: 'containers', years: '2+ yrs', achievements: [
                'Ran declarative GitOps deployments across a Kubernetes platform.',
                'Deployed ML model-serving workloads on AWS EKS.'
            ], projects: ['project-gitops-k8s', 'project-mlops-serving'] },
            { id: 'terraform', label: 'Terraform', category: 'iac', years: '2+ yrs', achievements: [
                'Wrote infrastructure-as-code workflows that cut manual ops overhead.',
                'Provisioned reproducible environments for the GitOps Kubernetes platform.'
            ], projects: ['project-gitops-k8s'] },
            { id: 'jenkins', label: 'Jenkins', category: 'cicd', years: '1+ yr', achievements: [
                'Converted manual configuration steps into stable Jenkins jobs.',
                'Designed a regex-based role/group access matrix for Jenkins.',
                'Built an MCP server exposing Jenkins pipeline operations to an LLM agent.'
            ], projects: ['project-mcp-jenkins'] },
            { id: 'argocd', label: 'ArgoCD', category: 'cicd', years: '1+ yr', achievements: [
                'Ran automated, declarative deployments via ArgoCD.',
                'Cut deployment inconsistencies through GitOps workflows.'
            ], projects: ['project-gitops-k8s'] },
            { id: 'python', label: 'Python', category: 'lang', years: '4+ yrs', achievements: [
                'Built automation, REST integrations, and Bitbucket diff-analyzers.',
                'Developed Playwright-based browser automation and self-healing UI tests.',
                'Trained deep learning models for satellite/radar data at ISRO.'
            ], projects: ['project-self-healing-ui', 'project-stock-lstm'] },
            { id: 'node-postgres', label: 'Node.js / PostgreSQL', category: 'app', years: '2+ yrs', achievements: [
                'Built a full-stack B2B platform with Node.js, Express, and PostgreSQL.',
                'Engineered a custom ETL pipeline for bulk CSV uploads with strict RBAC.'
            ], projects: ['project-rajeshwari'] },
            { id: 'observability', label: 'Prometheus / Grafana', category: 'observability', years: '1+ yr', achievements: [
                'Stood up full-stack observability with OpenTelemetry, Prometheus, and Grafana.',
                'Integrated SonarQube for continuous security scanning.'
            ], projects: ['project-devsecops-observability'] },
            { id: 'playwright', label: 'Playwright', category: 'testing', years: '1+ yr', achievements: [
                'Built a self-healing UI test framework with an LLM agent that repairs broken selectors.',
                'Automated implementation-team QA workflows at HotelKey.'
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

        TOPOLOGY_DATA.forEach(node => {
            if (node.id === hubId) return;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', layout[hubId].xPct);
            line.setAttribute('y1', layout[hubId].yPct);
            line.setAttribute('x2', layout[node.id].xPct);
            line.setAttribute('y2', layout[node.id].yPct);
            topoLines.appendChild(line);
        });

        TOPOLOGY_DATA.forEach(node => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `topo-node category-${node.category}`;
            btn.style.left = `${layout[node.id].xPct}%`;
            btn.style.top = `${layout[node.id].yPct}%`;
            btn.setAttribute('aria-haspopup', 'dialog');
            btn.dataset.nodeId = node.id;
            btn.innerHTML = `<span class="topo-node-dot" aria-hidden="true">${abbreviate(node.label)}</span><span class="topo-node-label">${node.label}</span>`;
            btn.addEventListener('click', () => openTopoDrawer(node.id));
            topoMap.appendChild(btn);
        });

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
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        }

        const projectTitleCache = {};

        function openTopoDrawer(nodeId) {
            const node = TOPOLOGY_DATA.find(n => n.id === nodeId);
            if (!node) return;
            lastFocusedNode = topoMap.querySelector(`.topo-node[data-node-id="${nodeId}"]`);
            drawerCategory.textContent = CATEGORY_LABELS[node.category] || node.category;
            drawerTitle.textContent = node.label;
            drawerYears.textContent = `${node.years} hands-on experience`;
            drawerAchievements.innerHTML = '';
            node.achievements.forEach(a => {
                const li = document.createElement('li');
                li.textContent = a;
                drawerAchievements.appendChild(li);
            });

            drawerProjects.innerHTML = '';
            node.projects.forEach(pid => {
                if (!projectTitleCache[pid]) {
                    try {
                        const titleEl = document.querySelector(`#${CSS.escape(pid)} .project-title`);
                        projectTitleCache[pid] = titleEl ? titleEl.textContent : pid;
                    } catch (e) {
                        projectTitleCache[pid] = pid;
                    }
                }
                const li = document.createElement('li');
                const aEl = document.createElement('a');
                aEl.href = `#${pid}`;
                aEl.textContent = projectTitleCache[pid];
                li.appendChild(aEl);
                drawerProjects.appendChild(li);
            });
            topoDrawer.hidden = false;
            drawerPanel.focus();
            document.addEventListener('keydown', onDrawerKeydown);
        }

        function closeTopoDrawer() {
            topoDrawer.hidden = true;
            document.removeEventListener('keydown', onDrawerKeydown);
            if (lastFocusedNode) lastFocusedNode.focus();
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
