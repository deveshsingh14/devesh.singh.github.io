document.addEventListener('DOMContentLoaded', () => {

    // Utility to escape user-supplied text before it is inserted as HTML
    const escapeHtml = (str) => str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    // Utility to throttle high-frequency events using requestAnimationFrame
    function throttle(callback) {
        let isWaiting = false;
        return function(...args) {
            if (!isWaiting) {
                isWaiting = true;
                window.requestAnimationFrame(() => {
                    callback.apply(this, args);
                    isWaiting = false;
                });
            }
        };
    }

    // ==========================================
    // Light/Dark Theme Toggle
    // ==========================================
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

    // Spotlight Effect
    const spotlight = document.getElementById('spotlight');
    
    // Only apply on non-touch devices
    if (window.matchMedia('(pointer: fine)').matches) {
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
    const hero = document.getElementById('hero');
    const scrollRail = document.getElementById('scroll-rail');
    const railDots = document.querySelectorAll('.scroll-rail-dot');
    const railConnectors = document.querySelectorAll('.scroll-rail-connector');
    const RAIL_SECTION_ORDER = [...railDots].map(dot => dot.dataset.target);

    // Change navbar style on scroll
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

    // Fade-in Animation on Scroll
    const revealElements = document.querySelectorAll('.reveal');
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

    // ==========================================
    // Typewriter Effect
    // ==========================================
    const phrases = ["AWS infrastructure.", "full-stack Node.js apps.", "CI/CD pipelines.", "LLM-Agent integrations.", "automated deployments."];
    let currentPhraseIndex = 0;
    let isDeleting = false;
    let txt = '';
    const typewriterElement = document.getElementById('typewriter');

    function typeWriter() {
        const fullTxt = phrases[currentPhraseIndex];

        if (isDeleting) {
            txt = fullTxt.substring(0, txt.length - 1);
        } else {
            txt = fullTxt.substring(0, txt.length + 1);
        }

        if(typewriterElement) typewriterElement.innerHTML = txt;

        let typeSpeed = 100;

        if (isDeleting) {
            typeSpeed /= 2;
        }

        if (!isDeleting && txt === fullTxt) {
            typeSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && txt === '') {
            isDeleting = false;
            currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
            typeSpeed = 500;
        }

        setTimeout(typeWriter, typeSpeed);
    }

    if(typewriterElement) typeWriter();

    // ==========================================
    // Interactive Canvas Background (Network/Particles)
    // ==========================================
    const canvas = document.getElementById('hero-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];

        function resizeCanvas() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = document.getElementById('hero').offsetHeight;
        }

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.radius = Math.random() * 2 + 1;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 87, 49, 0.35)';
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            const numParticles = Math.min(Math.floor(window.innerWidth / 20), 100);
            for (let i = 0; i < numParticles; i++) {
                particles.push(new Particle());
            }
        }
        initParticles();

        function animateParticles() {
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();

                // Draw connections
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distSq = dx * dx + dy * dy;

                    if (distSq < 22500) { // 150 * 150
                        const dist = Math.sqrt(distSq);
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(255, 87, 49, ${0.15 - dist/1000})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(animateParticles);
        }
        animateParticles();
    }

    // ==========================================
    // Experience: sticky sidebar scrollspy + hover dim-highlight
    // ==========================================
    const experienceNavItems = document.querySelectorAll('.experience-nav-item');
    const jobCards = document.querySelectorAll('.job-card');

    if (experienceNavItems.length && jobCards.length) {
        const navItemByTarget = {};
        experienceNavItems.forEach(item => { navItemByTarget[item.dataset.target] = item; });

        experienceNavItems.forEach(item => {
            item.addEventListener('click', () => {
                const target = document.getElementById(item.dataset.target);
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });

        // Scrollspy: highlight whichever job card is currently in the "focus band"
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

        // Hover dim-highlight: hovering (or focusing) either a sidebar item or a
        // job card dims every OTHER item in both lists, highlighting the pair.
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

    // ==========================================
    // 3D Tilt Effect for Project Cards
    // ==========================================
    const projectCards = document.querySelectorAll('.project-card');

    projectCards.forEach(card => {
        card.addEventListener('mousemove', throttle((e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position within the element
            const y = e.clientY - rect.top;  // y position within the element

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -10; // Max rotation 10deg
            const rotateY = ((x - centerX) / centerX) * 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        }));

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });

    // ==========================================
    // Project Filters
    // ==========================================
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

    // ==========================================
    // Animated Skill Bars (fill to target % once scrolled into view)
    // ==========================================
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

    // ==========================================
    // Animated Terminal Line-by-Line Engine
    // ==========================================
    let currentAnimation = null; // track running animation so we can cancel

    /** Types out lines one-by-one into #dynamic-output with realistic delays */
    const animateLines = (lines, container, onDone) => {
        let i = 0;
        const next = () => {
            if (i >= lines.length) { if (onDone) onDone(); return; }
            const { html, delay } = lines[i];
            const div = document.createElement('div');
            div.innerHTML = html;
            // start invisible, then fade in
            div.style.opacity = '0';
            div.style.transform = 'translateY(4px)';
            div.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
            container.appendChild(div);
            requestAnimationFrame(() => { div.style.opacity = '1'; div.style.transform = 'translateY(0)'; });
            container.scrollTop = container.scrollHeight;
            i++;
            currentAnimation = setTimeout(next, delay);
        };
        next();
    };

    /** Builds a progress bar string from 0-100% */
    const progressBar = (pct) => {
        const filled = Math.round(pct / 5);
        const empty = 20 - filled;
        return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${pct}%`;
    };

    // Interactive Terminal UI Logic — enhanced simulations
    const scripts = {
        'fix-pipeline': {
            cmd: './fix-pipeline.sh',
            promptReq: 'Pipeline failed! Prod is down. Enter command (logs / patch / restart):',
            placeholder: 'logs',
            simulate: (input, container, onDone) => {
                input = (input || '').toLowerCase().trim();
                let lines = [];

                if (input === 'logs') {
                    lines = [
                        { html: `<div class="output-line system-msg">[jenkins] Fetching logs for failed pod payment-service-xyz...</div>`, delay: 400 },
                        { html: `<div class="output-line error-msg">FATAL: Exception in thread "main" java.lang.OutOfMemoryError: Java heap space</div>`, delay: 600 },
                        { html: `<div class="output-line system-msg">Hint: The pod needs more memory. Try 'patch' to update resources.</div>`, delay: 300 }
                    ];
                } else if (input === 'patch') {
                    lines = [
                        { html: `<div class="output-line system-msg">[kubectl] Patching deployment payment-service...</div>`, delay: 400 },
                        { html: `<div class="output-line system-msg">Setting resources.requests.memory="1Gi" and limits.memory="2Gi"...</div>`, delay: 500 },
                        { html: `<div class="output-line system-msg">deployment.apps/payment-service patched</div>`, delay: 300 },
                        { html: `<div class="output-line system-msg">Hint: Deployment updated. Try 'restart' to apply changes immediately.</div>`, delay: 300 }
                    ];
                } else if (input === 'restart') {
                    lines = [
                        { html: `<div class="output-line system-msg">[kubectl] Rolling restart deployment payment-service...</div>`, delay: 500 },
                        { html: `<div class="output-line system-msg">Waiting for rollout to finish: 0 of 3 updated replicas are available...</div>`, delay: 600 },
                        { html: `<div class="output-line system-msg">Waiting for rollout to finish: 1 of 3 updated replicas are available...</div>`, delay: 600 },
                        { html: `<div class="output-line system-msg">Waiting for rollout to finish: 2 of 3 updated replicas are available...</div>`, delay: 600 },
                        { html: `<div class="output-line success-msg">[✓] deployment "payment-service" successfully rolled out. Pipeline FIXED!</div>`, delay: 200 }
                    ];
                } else {
                    lines = [
                        { html: `<div class="output-line error-msg">Command not recognized.</div>`, delay: 200 },
                        { html: `<div class="output-line system-msg">Available commands: logs, patch, restart</div>`, delay: 100 }
                    ];
                }

                animateLines(lines, container, onDone);
            }
        },
        'cidr-calc': {
            cmd: 'python3 cidr_calculator.py',
            promptReq: 'Enter IP and CIDR (e.g., 192.168.1.0/24):',
            placeholder: '10.0.0.0/24',
            simulate: (input, container, onDone) => {
                if (!input) input = '10.0.0.0/24';

                let lines = [
                    { html: `<div class="output-line system-msg">[calc] Parsing ${input}...</div>`, delay: 300 }
                ];

                try {
                    const parts = input.split('/');
                    if (parts.length !== 2) throw new Error("Invalid format");

                    const ipParts = parts[0].split('.');
                    if (ipParts.length !== 4) throw new Error("Invalid IP");

                    const cidr = parseInt(parts[1], 10);
                    if (isNaN(cidr) || cidr < 0 || cidr > 32) throw new Error("Invalid CIDR");

                    const mask = ~((1 << (32 - cidr)) - 1);
                    const ipNum = ipParts.reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0);

                    const networkNum = ipNum & mask;
                    const broadcastNum = networkNum | ~mask;
                    const numHosts = cidr === 31 || cidr === 32 ? 0 : Math.pow(2, 32 - cidr) - 2;

                    const numToIp = (num) => [
                        (num >>> 24) & 255,
                        (num >>> 16) & 255,
                        (num >>> 8) & 255,
                        num & 255
                    ].join('.');

                    lines.push(
                        { html: `<div class="output-line system-msg">Network Address: <span style="color:var(--teal)">${numToIp(networkNum)}</span></div>`, delay: 200 },
                        { html: `<div class="output-line system-msg">Broadcast Address: <span style="color:var(--teal)">${numToIp(broadcastNum)}</span></div>`, delay: 200 },
                        { html: `<div class="output-line system-msg">Usable Hosts: <span style="color:var(--teal)">${numHosts.toLocaleString()}</span></div>`, delay: 200 },
                        { html: `<div class="output-line system-msg">Subnet Mask: <span style="color:var(--teal)">${numToIp(mask)}</span></div>`, delay: 200 },
                        { html: `<div class="output-line success-msg">[✓] Calculation complete.</div>`, delay: 100 }
                    );

                } catch (e) {
                    lines.push({ html: `<div class="output-line error-msg">Error: Invalid CIDR format. Please use x.x.x.x/y format.</div>`, delay: 200 });
                }

                animateLines(lines, container, onDone);
            }
        },
        'cron-gen': {
            cmd: './cron_generator.sh',
            promptReq: 'Enter schedule description (e.g., "every day at midnight" or "every 15 minutes"):',
            placeholder: 'every day at midnight',
            simulate: (input, container, onDone) => {
                if (!input) input = 'every day at midnight';
                input = input.toLowerCase();

                let cron = "* * * * *";
                let desc = "unknown schedule";

                if (input.includes('15 minutes') || input.includes('15 min')) {
                    cron = "*/15 * * * *";
                    desc = "At every 15th minute.";
                } else if (input.includes('midnight') || (input.includes('day') && input.includes('0:00'))) {
                    cron = "0 0 * * *";
                    desc = "At 00:00 every day.";
                } else if (input.includes('sunday') && input.includes('night')) {
                    cron = "0 0 * * 0";
                    desc = "At 00:00 on Sunday.";
                } else if (input.includes('hour')) {
                    cron = "0 * * * *";
                    desc = "At minute 0 past every hour.";
                } else {
                    cron = "0 12 * * *"; // default fallback
                    desc = "At 12:00 every day (fallback interpretation).";
                }

                animateLines([
                    { html: `<div class="output-line system-msg">[cron] Analyzing NLP input: "${input}"...</div>`, delay: 500 },
                    { html: `<div class="output-line system-msg">----------------------------------------</div>`, delay: 200 },
                    { html: `<div class="output-line system-msg">Generated Cron: <span style="color:var(--teal); font-weight:bold; font-size: 1.1em;">${cron}</span></div>`, delay: 300 },
                    { html: `<div class="output-line system-msg">Explanation: ${desc}</div>`, delay: 200 },
                    { html: `<div class="output-line system-msg">----------------------------------------</div>`, delay: 200 },
                    { html: `<div class="output-line success-msg">[✓] Ready for crontab insertion.</div>`, delay: 100 }
                ], container, onDone);
            }
        },
        'k8s-deploy': {
            cmd: './k8s-deploy.sh',
            promptReq: 'Enter Deployment Name:',
            placeholder: 'frontend-app',
            simulate: (input, container, onDone) => {
                if (!input) input = 'frontend-app';
                animateLines([
                    { html: `<div class="output-line system-msg">[kubectl] Setting context to cluster 'prod-cluster-us-east-1'...</div>`, delay: 500 },
                    { html: `<div class="output-line system-msg">[kubectl] Analyzing deployment manifest for ${input}...</div>`, delay: 400 },
                    { html: `<div class="output-line system-msg">[kubectl] Validating resource requests and limits...</div>`, delay: 300 },
                    { html: '<div class="output-line system-msg">[helm] Upgrading release...</div>', delay: 600 },
                    { html: `<div class="output-line system-msg">[k8s] ${progressBar(0)}</div>`, delay: 300 },
                    { html: `<div class="output-line system-msg">[k8s] ${progressBar(25)} Creating new ReplicaSet...</div>`, delay: 350 },
                    { html: `<div class="output-line system-msg">[k8s] ${progressBar(50)} Terminating old pods...</div>`, delay: 300 },
                    { html: `<div class="output-line system-msg">[k8s] ${progressBar(75)} Waiting for readiness probes...</div>`, delay: 350 },
                    { html: `<div class="output-line system-msg">[k8s] ${progressBar(100)} Rollout successful!</div>`, delay: 400 },
                    { html: `<div class="output-line success-msg">[✓] Deployment ${input} successfully rolled out to prod.</div>`, delay: 0 }
                ], container, onDone);
            }
        },
        'docker-build': {
            cmd: 'python3 docker-build.py',
            promptReq: 'Enter Repository/Image Name:',
            placeholder: 'hotelkey/auth-service',
            simulate: (input, container, onDone) => {
                if (!input) input = 'hotelkey/auth-service';
                animateLines([
                    { html: `<div class="output-line system-msg">[docker] Fetching latest commit for ${input}...</div>`, delay: 400 },
                    { html: `<div class="output-line system-msg">[docker] Building image with tag v2.4.1...</div>`, delay: 500 },
                    { html: '<div class="output-line system-msg">[docker] Step 1/7 : FROM python:3.9-slim</div>', delay: 300 },
                    { html: '<div class="output-line system-msg">[docker] ---> 8a9b6c4d2e1f</div>', delay: 100 },
                    { html: '<div class="output-line system-msg">[docker] Step 2/7 : WORKDIR /app</div>', delay: 200 },
                    { html: '<div class="output-line system-msg">[docker] ---> Running in 3b2a1c4d5e6f</div>', delay: 150 },
                    { html: '<div class="output-line system-msg">[docker] Step 3/7 : COPY requirements.txt .</div>', delay: 200 },
                    { html: '<div class="output-line system-msg">[docker] Step 4/7 : RUN pip install -r requirements.txt</div>', delay: 600 },
                    { html: `<div class="output-line system-msg">[docker] Installing packages ${progressBar(50)}</div>`, delay: 400 },
                    { html: `<div class="output-line system-msg">[docker] Installing packages ${progressBar(100)}</div>`, delay: 400 },
                    { html: '<div class="output-line system-msg">[docker] Successfully built 9f8e7d6c5b4a</div>', delay: 300 },
                    { html: '<div class="output-line system-msg">[docker] Pushing to Amazon ECR...</div>', delay: 500 },
                    { html: `<div class="output-line success-msg">[✓] Image ${input}:v2.4.1 successfully built and pushed.</div>`, delay: 0 }
                ], container, onDone);
            }
        },
    };

    const scriptItems = document.querySelectorAll('.script-item');
    const terminalOutput = document.getElementById('terminal-output');
    
    // Function to render the initial state of a script
    const renderTerminal = (scriptKey) => {
        // Cancel any running animation
        if (currentAnimation) { clearTimeout(currentAnimation); currentAnimation = null; }

        const script = scripts[scriptKey];
        terminalOutput.innerHTML = `
            <div class="output-line"><span class="prompt">$</span> <span class="command">${script.cmd}</span></div>
            <div class="output-line system-msg">Loading dependencies...</div>
            <div class="output-line prompt-req">${script.promptReq}</div>
            <div class="interactive-input">
                <span class="prompt">></span> <input type="text" id="tool-input" placeholder="${script.placeholder}" autocomplete="off" aria-label="Terminal command input">
                <button id="run-btn">Run Script</button>
            </div>
            <div id="dynamic-output" aria-live="polite"></div>
        `;
        attachRunEvent(scriptKey);
    };

    // Attach event listener to the run button dynamically
    const attachRunEvent = (scriptKey) => {
        const runBtn = document.getElementById('run-btn');
        const inputField = document.getElementById('tool-input');
        const dynamicOutput = document.getElementById('dynamic-output');

        const executeSim = () => {
            let val = inputField.value.trim();

            // Sanitize user input to prevent DOM XSS
            val = escapeHtml(val);

            // Disable input while running
            inputField.disabled = true;
            runBtn.disabled = true;
            runBtn.innerHTML = '<span class="spinner"></span> Running…';
            runBtn.classList.add('running');
            
            dynamicOutput.innerHTML = '';
            
            // Call the animated simulate function
            scripts[scriptKey].simulate(val, dynamicOutput, () => {
                inputField.disabled = false;
                runBtn.disabled = false;
                runBtn.innerText = 'Run Script';
                runBtn.classList.remove('running');
                inputField.value = '';
                inputField.focus();
            });
        };

        runBtn.addEventListener('click', executeSim);
        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') executeSim();
        });
    };

    // Handle clicking different scripts in sidebar
    scriptItems.forEach(item => {
        const selectScript = () => {
            // Update active class
            scriptItems.forEach(i => {
                i.classList.remove('active');
                i.setAttribute('aria-selected', 'false');
            });
            item.classList.add('active');
            item.setAttribute('aria-selected', 'true');
            
            const scriptKey = item.getAttribute('data-script');
            
            if (scriptKey === 'password-gen') {
                if (currentAnimation) { clearTimeout(currentAnimation); currentAnimation = null; }
                terminalOutput.style.display = 'none';
                document.querySelectorAll('.gui-body').forEach(el => el.style.display = 'none');
                document.getElementById('gui-output-password').style.display = 'flex';
                document.querySelector('.terminal-title').innerText = 'Password Generator App';
            } else if (scriptKey === 'docx-to-pdf') {
                if (currentAnimation) { clearTimeout(currentAnimation); currentAnimation = null; }
                terminalOutput.style.display = 'none';
                document.querySelectorAll('.gui-body').forEach(el => el.style.display = 'none');
                document.getElementById('gui-output-docx').style.display = 'flex';
                document.querySelector('.terminal-title').innerText = 'DOCX to PDF Converter';
            } else {
                document.querySelectorAll('.gui-body').forEach(el => el.style.display = 'none');
                terminalOutput.style.display = 'block';
                document.querySelector('.terminal-title').innerText = 'user@dsb-macbook: ~/devops-tools';
                // Render corresponding terminal UI
                renderTerminal(scriptKey);
            }
        };

        item.addEventListener('click', selectScript);
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectScript();
            }
        });
    });

    // Initialize first script
    renderTerminal('k8s-deploy');

    // ==========================================
    // Password Generator GUI Logic
    // ==========================================
    
    // GUI Tabs Logic
    const guiTabs = document.querySelectorAll('.gui-tab');
    const guiTabContents = document.querySelectorAll('.gui-tab-content');
    
    guiTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            guiTabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            guiTabContents.forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            document.getElementById(tab.getAttribute('data-tab')).classList.add('active');
        });
    });

    // Password Elements
    const pgResult = document.getElementById('pg-result');
    const pgLength = document.getElementById('pg-length');
    const pgLengthLabel = document.getElementById('pg-length-label');
    const pgUpper = document.getElementById('pg-upper');
    const pgLower = document.getElementById('pg-lower');
    const pgNums = document.getElementById('pg-nums');
    const pgSyms = document.getElementById('pg-syms');
    const pgMinNums = document.getElementById('pg-min-nums');
    const pgMinSyms = document.getElementById('pg-min-syms');
    const pgAmbig = document.getElementById('pg-ambig');
    const pgRefresh = document.getElementById('pg-refresh');
    const pgCopy = document.getElementById('pg-copy');

    const BASE_UPPER_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const BASE_LOWER_CHARS = "abcdefghijklmnopqrstuvwxyz";
    const BASE_NUM_CHARS = "0123456789";
    const AMBIGUOUS_CHARS = "l1IO0";

    const UNAMBIG_UPPER_CHARS = BASE_UPPER_CHARS.split('').filter(c => !AMBIGUOUS_CHARS.includes(c)).join('');
    const UNAMBIG_LOWER_CHARS = BASE_LOWER_CHARS.split('').filter(c => !AMBIGUOUS_CHARS.includes(c)).join('');
    const UNAMBIG_NUM_CHARS = BASE_NUM_CHARS.split('').filter(c => !AMBIGUOUS_CHARS.includes(c)).join('');

    // Passphrase Elements
    const ppResult = document.getElementById('pp-result');
    const ppWords = document.getElementById('pp-words');
    const ppWordsLabel = document.getElementById('pp-words-label');
    const ppSep = document.getElementById('pp-sep');
    const ppCap = document.getElementById('pp-cap');
    const ppRefresh = document.getElementById('pp-refresh');
    const ppCopy = document.getElementById('pp-copy');

    const wordlist = [
        "apple", "brave", "crane", "dance", "eagle", "flame", "grape", "house", "image", "juice",
        "knife", "lemon", "mouse", "night", "ocean", "peace", "queen", "river", "snake", "train",
        "uncle", "voice", "water", "xray", "yacht", "zebra", "cloud", "storm", "light", "shadow",
        "forest", "mountain", "valley", "spring", "summer", "autumn", "winter", "silver", "gold"
    ];

    function getSecureRandom() {
        const randomBuffer = new Uint32Array(1);
        window.crypto.getRandomValues(randomBuffer);
        return randomBuffer[0] / (0xFFFFFFFF + 1);
    }

    function getRandomChar(str) {
        return str[Math.floor(getSecureRandom() * str.length)];
    }

    function generatePassword() {
        const length = parseInt(pgLength.value);
        const useUpper = pgUpper.checked;
        const useLower = pgLower.checked;
        const useNums = pgNums.checked;
        const useSyms = pgSyms.checked;
        const avoidAmbig = pgAmbig.checked;
        
        const minNums = parseInt(pgMinNums.value) || 0;
        const minSyms = parseInt(pgMinSyms.value) || 0;

        let upperChars = BASE_UPPER_CHARS;
        let lowerChars = BASE_LOWER_CHARS;
        let numChars = BASE_NUM_CHARS;
        let symChars = "!@#$%^&*";

        if (avoidAmbig) {
            upperChars = UNAMBIG_UPPER_CHARS;
            lowerChars = UNAMBIG_LOWER_CHARS;
            numChars = UNAMBIG_NUM_CHARS;
        }

        let pool = "";
        if (useUpper) pool += upperChars;
        if (useLower) pool += lowerChars;
        if (useNums) pool += numChars;
        if (useSyms) pool += symChars;

        if (!pool) {
            pgResult.value = "Select at least one character set.";
            return;
        }

        let passwordChars = [];
        
        if (useNums && minNums > 0) {
            for (let i = 0; i < Math.min(minNums, length); i++) {
                passwordChars.push(getRandomChar(numChars));
            }
        }
        
        if (useSyms && minSyms > 0) {
            for (let i = 0; i < Math.min(minSyms, length - passwordChars.length); i++) {
                passwordChars.push(getRandomChar(symChars));
            }
        }

        const remainingLength = length - passwordChars.length;
        for (let i = 0; i < remainingLength; i++) {
            passwordChars.push(getRandomChar(pool));
        }

        // Shuffle
        for (let i = passwordChars.length - 1; i > 0; i--) {
            const j = Math.floor(getSecureRandom() * (i + 1));
            [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
        }

        pgResult.value = passwordChars.join('').substring(0, length);
    }

    function generatePassphrase() {
        const numWords = parseInt(ppWords.value);
        const separator = ppSep.value;
        const capitalize = ppCap.checked;

        let words = [];
        for (let i = 0; i < numWords; i++) {
            let word = wordlist[Math.floor(getSecureRandom() * wordlist.length)];
            if (capitalize) {
                word = word.charAt(0).toUpperCase() + word.slice(1);
            }
            words.push(word);
        }

        ppResult.value = words.join(separator);
    }

    // Attach Events
    pgLength.addEventListener('input', (e) => {
        pgLengthLabel.innerText = `Length: ${e.target.value}`;
        generatePassword();
    });
    
    [pgUpper, pgLower, pgNums, pgSyms, pgAmbig, pgMinNums, pgMinSyms].forEach(el => {
        el.addEventListener('change', generatePassword);
        el.addEventListener('input', generatePassword);
    });
    
    function copyToClipboard(textToCopy, buttonElement) {
        navigator.clipboard.writeText(textToCopy);
        buttonElement.innerText = "Copied!";
        setTimeout(() => buttonElement.innerText = "Copy", 2000);
    }

    pgRefresh.addEventListener('click', generatePassword);
    pgCopy.addEventListener('click', () => copyToClipboard(pgResult.value, pgCopy));

    ppWords.addEventListener('input', (e) => {
        ppWordsLabel.innerText = `Number of words: ${e.target.value}`;
        generatePassphrase();
    });

    [ppSep, ppCap].forEach(el => {
        el.addEventListener('change', generatePassphrase);
        el.addEventListener('input', generatePassphrase);
    });
    
    ppRefresh.addEventListener('click', generatePassphrase);
    ppCopy.addEventListener('click', () => copyToClipboard(ppResult.value, ppCopy));

    // Auto-select text on click/focus for easier copying
    const autoSelectText = (e) => e.target.select();
    [pgResult, ppResult].forEach(el => {
        el.addEventListener('click', autoSelectText);
        el.addEventListener('focus', autoSelectText);
    });

    // Initial Generation
    generatePassword();
    generatePassphrase();

    // ==========================================
    // DOCX to PDF Logic
    // ==========================================
    const docxUploadArea = document.getElementById('docx-upload-area');
    const docxFileInput = document.getElementById('docx-file-input');
    const docxStatus = document.getElementById('docx-status');
    const btnConvertDocx = document.getElementById('btn-convert-docx');
    const docxPreview = document.getElementById('docx-preview');
    let selectedDocxFile = null;

    if (docxUploadArea) {
        docxUploadArea.addEventListener('click', () => docxFileInput.click());
        
        docxUploadArea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                docxFileInput.click();
            }
        });

        docxUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            docxUploadArea.style.borderColor = 'var(--teal)';
            docxUploadArea.style.backgroundColor = 'var(--teal-tint)';
        });
        
        docxUploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            docxUploadArea.style.borderColor = 'var(--slate)';
            docxUploadArea.style.backgroundColor = 'transparent';
        });
        
        docxUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            docxUploadArea.style.borderColor = 'var(--slate)';
            docxUploadArea.style.backgroundColor = 'transparent';
            if (e.dataTransfer.files.length) {
                handleDocxSelection(e.dataTransfer.files[0]);
            }
        });
        
        docxFileInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                handleDocxSelection(e.target.files[0]);
            }
        });
        
        function handleDocxSelection(file) {
            if (file.name.endsWith('.docx')) {
                selectedDocxFile = file;
                docxStatus.innerText = `Selected: ${file.name}`;
                docxStatus.style.color = 'var(--teal)';
                btnConvertDocx.style.display = 'block';
            } else {
                selectedDocxFile = null;
                docxStatus.innerText = 'Error: Please select a valid .docx file.';
                docxStatus.style.color = 'var(--danger)';
                btnConvertDocx.style.display = 'none';
            }
        }
        
        btnConvertDocx.addEventListener('click', async () => {
            if (!selectedDocxFile) return;
            
            btnConvertDocx.disabled = true;
            btnConvertDocx.innerHTML = '<span class="spinner"></span> Converting...';
            docxStatus.innerText = 'Extracting content from DOCX...';
            docxStatus.style.color = 'var(--teal)';
            
            try {
                if (typeof mammoth === 'undefined' || typeof html2pdf === 'undefined') {
                    throw new Error("Conversion libraries failed to load. Please check your internet connection.");
                }

                const arrayBuffer = await selectedDocxFile.arrayBuffer();
                const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
                docxPreview.innerHTML = `<div style="padding: 40px; color: #000; background: #fff; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6;">${result.value}</div>`;
                
                docxStatus.innerText = 'Generating PDF file...';
                
                const opt = {
                    margin:       0.5,
                    filename:     selectedDocxFile.name.replace('.docx', '.pdf'),
                    image:        { type: 'jpeg', quality: 0.98 },
                    html2canvas:  { scale: 2 },
                    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
                };
                
                await html2pdf().set(opt).from(docxPreview.firstElementChild).save();
                
                docxStatus.innerText = 'Conversion Complete! Your PDF has been downloaded.';
            } catch (err) {
                console.error(err);
                docxStatus.innerText = err.message || 'Error during conversion. Check console for details.';
                docxStatus.style.color = 'var(--danger)';
            } finally {
                btnConvertDocx.disabled = false;
                btnConvertDocx.innerText = 'Convert to PDF';
            }
        });
    }

    // ==========================================
    // Contact Form Asynchronous Submission
    // ==========================================
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('.submit-btn');
            const originalHTML = submitBtn.innerHTML;

            // Set loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner"></span> Sending...';
            submitBtn.style.opacity = '0.7';
            submitBtn.style.cursor = 'not-allowed';

            try {
                const formData = new FormData(contactForm);
                const response = await fetch(contactForm.action, {
                    method: contactForm.method,
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    submitBtn.innerText = 'Message Sent!';
                    submitBtn.style.backgroundColor = 'var(--teal-tint)';
                    contactForm.reset();
                } else {
                    submitBtn.innerText = 'Error: Please try again.';
                    submitBtn.style.color = 'var(--danger)';
                    submitBtn.style.borderColor = 'var(--danger)';
                }
            } catch (error) {
                submitBtn.innerText = 'Error: Network issue.';
                submitBtn.style.color = 'var(--danger)';
                submitBtn.style.borderColor = 'var(--danger)';
            } finally {
                // Revert after 3 seconds
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalHTML;
                    submitBtn.style.opacity = '';
                    submitBtn.style.cursor = '';
                    submitBtn.style.backgroundColor = '';
                    submitBtn.style.color = '';
                    submitBtn.style.borderColor = '';
                }, 3000);
            }
        });
    }

    // ==========================================
    // Shared: line-by-line typing effect (used by the hero terminal
    // and the pipeline log — kept independent of the Tools section's
    // `animateLines`/`currentAnimation` so the features never cancel
    // each other's in-flight animations).
    // ==========================================
    const typeLines = (lines, container, onDone) => {
        let i = 0;
        const next = () => {
            if (i >= lines.length) { if (onDone) onDone(); return; }
            const { html, delay } = lines[i];
            const div = document.createElement('div');
            div.innerHTML = html;
            div.style.opacity = '0';
            div.style.transform = 'translateY(4px)';
            div.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
            container.appendChild(div);
            requestAnimationFrame(() => { div.style.opacity = '1'; div.style.transform = 'translateY(0)'; });
            container.scrollTop = container.scrollHeight;
            i++;
            setTimeout(next, delay);
        };
        next();
    };

    const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ==========================================
    // Hero Terminal
    // ==========================================
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
            div.innerHTML = `<span style="color:var(--teal)">guest@devesh:~$</span> ${escapeHtml(raw)}`;
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
            lines.push({ html: `<div class="term-line">→ <a href="#experience">jump to full experience section</a></div>`, delay: 120 });
            return lines;
        };

        const buildProjectsLines = () => {
            const lines = PORTFOLIO_DATA.projects.map(p => ({
                html: `<div class="term-line"><span style="color:var(--teal)">${p.name}</span> — ${p.stack}</div>`,
                delay: 120
            }));
            lines.push({ html: `<div class="term-line">→ <a href="#projects">jump to full projects section</a></div>`, delay: 120 });
            return lines;
        };

        const buildContactLines = () => {
            const c = PORTFOLIO_DATA.contact;
            return [
                { html: `<div class="term-line">email: <a href="mailto:${c.email}">${c.email}</a></div>`, delay: 120 },
                { html: `<div class="term-line">github: <a href="${c.github}" target="_blank" rel="noreferrer">${c.github}</a></div>`, delay: 120 },
                { html: `<div class="term-line">linkedin: <a href="${c.linkedin}" target="_blank" rel="noreferrer">${c.linkedin}</a></div>`, delay: 120 },
                { html: `<div class="term-line">→ <a href="#contact">jump to contact form</a></div>`, delay: 120 }
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

    // ==========================================
    // Ops Dashboard: Pipeline Visualizer + System Metrics
    // ==========================================
    const PIPELINE_STATE = { running: false };

    const runPipelineBtn = document.getElementById('run-pipeline');
    const pipelineStatusLive = document.getElementById('pipeline-status');
    const pipelineLog = document.getElementById('pipeline-log');
    const pipelineStageEls = document.querySelectorAll('.pipeline-stage');
    const pipelineConnectorEls = document.querySelectorAll('.pipeline-connector');

    if (runPipelineBtn && pipelineStatusLive && pipelineLog && pipelineStageEls.length) {
        const STAGE_ORDER = ['build', 'test', 'scan', 'deploy'];
        const stageElByName = {};
        pipelineStageEls.forEach(el => { stageElByName[el.getAttribute('data-stage')] = el; });

        const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

        let buildNumber = 127;

        const STAGE_LOGS = {
            build: () => {
                buildNumber += 1;
                return [
                    { html: `<div class="log-line">[build] Installing dependencies…</div>`, delay: 350 },
                    { html: `<div class="log-line">[build] Compiling artifacts…</div>`, delay: 450 },
                    { html: `<div class="log-line success-msg">[build] Artifact created: portfolio-app-v2.4.${buildNumber}.tar.gz</div>`, delay: 250 }
                ];
            },
            test: () => [
                { html: `<div class="log-line">[test] Running unit test suite…</div>`, delay: 350 },
                { html: `<div class="log-line">[test] 128 passed, 0 failed</div>`, delay: 400 },
                { html: `<div class="log-line success-msg">[test] Coverage: 94.2%</div>`, delay: 250 }
            ],
            scan: () => [
                { html: `<div class="log-line">[scan] Running SonarQube static analysis…</div>`, delay: 350 },
                { html: `<div class="log-line">[scan] Scanning dependencies for CVEs…</div>`, delay: 450 }
            ],
            deploy: () => [
                { html: `<div class="log-line">[deploy] Rolling out via ArgoCD…</div>`, delay: 350 },
                { html: `<div class="log-line">[deploy] Waiting for readiness probes…</div>`, delay: 450 },
                { html: `<div class="log-line success-msg">[deploy] Rollout complete. All replicas healthy.</div>`, delay: 250 }
            ]
        };

        const SCAN_RETRY_LOGS = [
            { html: `<div class="log-line error-msg">[scan] Vulnerable dependency detected: lodash@4.17.15 (CVE-2020-8203)</div>`, delay: 300 },
            { html: `<div class="log-line">[scan] Auto-patching to lodash@4.17.21…</div>`, delay: 400 },
            { html: `<div class="log-line success-msg">[scan] Re-scan clean. 0 vulnerabilities found.</div>`, delay: 250 }
        ];

        const shouldScanFailThisRun = () => Math.random() < 0.2;

        const fillConnectorAfter = (stageName) => {
            const idx = STAGE_ORDER.indexOf(stageName);
            const connector = pipelineConnectorEls[idx];
            if (connector) connector.classList.add('filled');
        };

        const resetPipelineUi = () => {
            pipelineStageEls.forEach(el => el.removeAttribute('data-status'));
            pipelineConnectorEls.forEach(el => el.classList.remove('filled'));
            pipelineLog.innerHTML = '';
        };

        const runPipeline = () => {
            if (PIPELINE_STATE.running) return;
            PIPELINE_STATE.running = true;
            resetPipelineUi();
            runPipelineBtn.disabled = true;
            runPipelineBtn.innerHTML = '<span class="spinner"></span> Running…';
            pipelineStatusLive.textContent = 'Starting pipeline…';

            let scanRetried = false;
            let stageIndex = 0;

            const finish = () => {
                PIPELINE_STATE.running = false;
                pipelineStatusLive.textContent = 'Deployment complete. All stages green.';
                runPipelineBtn.disabled = false;
                runPipelineBtn.textContent = 'Run Pipeline';
                if (typeof window.__incrementDeploymentCount === 'function') {
                    window.__incrementDeploymentCount();
                }
            };

            const advance = () => {
                stageIndex += 1;
                if (stageIndex < STAGE_ORDER.length) {
                    runStage(STAGE_ORDER[stageIndex]);
                } else {
                    finish();
                }
            };

            const runStage = (name) => {
                const el = stageElByName[name];
                el.setAttribute('data-status', 'running');
                pipelineStatusLive.textContent = `${capitalize(name)}: running…`;

                typeLines(STAGE_LOGS[name](), pipelineLog, () => {
                    if (name === 'scan' && !scanRetried && shouldScanFailThisRun()) {
                        scanRetried = true;
                        el.setAttribute('data-status', 'fail');
                        pipelineStatusLive.textContent = 'Scan: vulnerability found — patching and retrying…';
                        typeLines(SCAN_RETRY_LOGS, pipelineLog, () => {
                            el.setAttribute('data-status', 'success');
                            fillConnectorAfter(name);
                            pipelineStatusLive.textContent = 'Scan: success (after 1 retry).';
                            advance();
                        });
                        return;
                    }
                    el.setAttribute('data-status', 'success');
                    fillConnectorAfter(name);
                    pipelineStatusLive.textContent = `${capitalize(name)}: success.`;
                    advance();
                });
            };

            runStage(STAGE_ORDER[0]);
        };

        runPipelineBtn.addEventListener('click', runPipeline);

        const opsSection = document.getElementById('ops');
        if (opsSection) {
            const pipelineAutoRunObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        runPipeline();
                        observer.disconnect();
                    }
                });
            }, { threshold: 0.4 });
            pipelineAutoRunObserver.observe(opsSection);
        }
    }

    // ==========================================
    // Ops Dashboard: System Metrics
    // ==========================================
    const metricCpuValue = document.getElementById('metric-cpu-value');
    const metricCpuFill = document.getElementById('metric-cpu-fill');
    const metricMemValue = document.getElementById('metric-mem-value');
    const metricMemFill = document.getElementById('metric-mem-fill');
    const metricUptime = document.getElementById('metric-uptime');
    const metricDeployments = document.getElementById('metric-deployments');
    const metricCoffee = document.getElementById('metric-coffee');

    /** Formats an elapsed-ms duration as "DDd HH:MM:SS" — pure/testable. */
    function formatUptime(ms) {
        const totalSeconds = Math.max(0, Math.floor(ms / 1000));
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const pad = (n) => String(n).padStart(2, '0');
        return `${pad(days)}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    window.formatUptime = formatUptime;

    if (metricCpuValue && metricCpuFill && metricMemValue && metricMemFill && metricUptime && metricDeployments && metricCoffee) {
        const SITE_EPOCH_MS = new Date('2025-06-01T00:00:00Z').getTime();
        let deploymentCount = 1842;
        let cpuVal = 18;
        let memVal = 34;
        const motionOk = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;

        const renderMetricTile = (valueEl, fillEl, value) => {
            const rounded = Math.round(value);
            valueEl.textContent = `${rounded}%`;
            fillEl.style.width = `${rounded}%`;
            fillEl.classList.remove('level-warn', 'level-danger');
            if (rounded > 85) fillEl.classList.add('level-danger');
            else if (rounded > 60) fillEl.classList.add('level-warn');
        };

        const stepMetric = (current, baseline) => {
            const spikeBias = PIPELINE_STATE.running ? 30 : 0;
            const target = baseline + spikeBias + (Math.random() * 10 - 5);
            const next = current + (target - current) * 0.3 + (Math.random() * 4 - 2);
            return Math.max(3, Math.min(97, next));
        };

        const tickMetrics = () => {
            cpuVal = stepMetric(cpuVal, 18);
            memVal = stepMetric(memVal, 34);
            renderMetricTile(metricCpuValue, metricCpuFill, cpuVal);
            renderMetricTile(metricMemValue, metricMemFill, memVal);
        };

        renderMetricTile(metricCpuValue, metricCpuFill, cpuVal);
        renderMetricTile(metricMemValue, metricMemFill, memVal);
        if (motionOk) setInterval(tickMetrics, 2000);

        const tickUptime = () => { metricUptime.textContent = formatUptime(Date.now() - SITE_EPOCH_MS); };
        tickUptime();
        setInterval(tickUptime, 1000);

        const renderDeployments = () => { metricDeployments.textContent = deploymentCount.toLocaleString(); };
        renderDeployments();

        window.__incrementDeploymentCount = () => {
            deploymentCount += 1;
            renderDeployments();
        };

        metricCoffee.textContent = `${(4 + Math.random() * 0.6).toFixed(1)} cups / 1k LOC`;
    }

    // ==========================================
    // Tech Stack Topology Map
    // ==========================================
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

        function openTopoDrawer(nodeId) {
            const node = TOPOLOGY_DATA.find(n => n.id === nodeId);
            if (!node) return;
            lastFocusedNode = topoMap.querySelector(`.topo-node[data-node-id="${nodeId}"]`);
            drawerCategory.textContent = CATEGORY_LABELS[node.category] || node.category;
            drawerTitle.textContent = node.label;
            drawerYears.textContent = `${node.years} hands-on experience`;
            drawerAchievements.innerHTML = node.achievements.map(a => `<li>${a}</li>`).join('');
            drawerProjects.innerHTML = node.projects.map(pid => {
                const titleEl = document.querySelector(`#${pid} .project-title`);
                const label = titleEl ? titleEl.textContent : pid;
                return `<li><a href="#${pid}">${label}</a></li>`;
            }).join('');
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
});
