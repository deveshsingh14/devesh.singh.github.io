document.addEventListener('DOMContentLoaded', () => {
    // Spotlight Effect
    const spotlight = document.getElementById('spotlight');
    
    // Only apply on non-touch devices
    if (window.matchMedia('(pointer: fine)').matches) {
        document.addEventListener('mousemove', (e) => {
            const x = e.clientX;
            const y = e.clientY;
            spotlight.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(29, 78, 216, 0.15), transparent 80%)`;
        });
    }

    // Scroll Spy for Top Navigation
    const sections = document.querySelectorAll('section, header');
    const navLinks = document.querySelectorAll('.nav-link');
    const navbar = document.getElementById('navbar');

    // Change navbar style on scroll
    let isScrolling = false;

    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                const scrollY = window.scrollY;

                if (scrollY > 50) {
                    navbar.style.boxShadow = '0 10px 30px -10px rgba(2, 12, 27, 0.7)';
                    navbar.style.height = '70px';
                } else {
                    navbar.style.boxShadow = 'none';
                    navbar.style.height = '80px';
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
                    if (link.getAttribute('href').includes(current)) {
                        link.classList.add('active');
                    }
                });

                isScrolling = false;
            });
            isScrolling = true;
        }
    });

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
    const phrases = ["resilient cloud ecosystems.", "automated deployment pipelines.", "scalable infrastructure.", "reliable CI/CD processes."];
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
                ctx.fillStyle = 'rgba(100, 255, 218, 0.3)';
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
                        ctx.strokeStyle = `rgba(100, 255, 218, ${0.15 - dist/1000})`;
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
    // 3D Tilt Effect for Project Cards
    // ==========================================
    const projectCards = document.querySelectorAll('.project-card');

    projectCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position within the element
            const y = e.clientY - rect.top;  // y position within the element

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -10; // Max rotation 10deg
            const rotateY = ((x - centerX) / centerX) * 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });

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
        'aws-monitor': {
            cmd: 'python3 aws-monitor.py',
            promptReq: 'Enter AWS Service to monitor:',
            placeholder: 'EC2 / RDS / Lambda',
            simulate: (input, container, onDone) => {
                if (!input) input = 'EC2';
                animateLines([
                    { html: `<div class="output-line system-msg">[aws] Authenticating via IAM Roles...</div>`, delay: 500 },
                    { html: `<div class="output-line system-msg">[aws] Fetching CloudWatch metrics for ${input}...</div>`, delay: 600 },
                    { html: '<div class="output-line system-msg">[aws] Analyzing CPU Utilization, Memory, and Network I/O...</div>', delay: 400 },
                    { html: '<div class="output-line system-msg">----------------------------------------</div>', delay: 200 },
                    { html: '<div class="output-line system-msg">Instance ID       CPU%    MEM%    STATUS</div>', delay: 200 },
                    { html: '<div class="output-line system-msg">i-0a1b2c3d4e5f    12.4    45.2    <span style="color:#27c93f">HEALTHY</span></div>', delay: 150 },
                    { html: '<div class="output-line system-msg">i-0f9e8d7c6b5a    89.1    92.0    <span style="color:#ffbd2e">WARNING</span></div>', delay: 150 },
                    { html: '<div class="output-line system-msg">i-1a2b3c4d5e6f     2.1    15.0    <span style="color:#27c93f">HEALTHY</span></div>', delay: 150 },
                    { html: '<div class="output-line system-msg">----------------------------------------</div>', delay: 200 },
                    { html: '<div class="output-line system-msg">[aws] Alert: High CPU on i-0f9e8d7c6b5a, triggering auto-scaling policy...</div>', delay: 600 },
                    { html: `<div class="output-line success-msg">[✓] Monitoring check complete. Auto-scaling action initiated.</div>`, delay: 0 }
                ], container, onDone);
            }
        },
        'playwright-test': {
            cmd: 'npx playwright test',
            promptReq: 'Enter Test Suite Name:',
            placeholder: 'e2e-checkout',
            simulate: (input, container, onDone) => {
                if (!input) input = 'e2e-checkout';
                const words = ['the', 'quick', 'brown', 'fox', 'jumps', 'over', 'a', 'lazy', 'dog', 'near', 'the', 'river', 'bank', 'while', 'birds', 'fly'];
                const wordStr = words.map(w => `<span style="color: #27c93f">${w}</span> `).join('');
                animateLines([
                    { html: '<div class="output-line system-msg">[bot] Initializing Playwright...</div>', delay: 500 },
                    { html: `<div class="output-line system-msg">[bot] Testing phrase mapping: ${wordStr}</div>`, delay: 400 },
                    { html: `<div class="output-line system-msg">[playwright] Running 1 test in suite ${input}...</div>`, delay: 600 },
                    { html: `<div class="output-line system-msg">[playwright] ✅ Test passed.</div>`, delay: 400 },
                    { html: `<div class="output-line success-msg">[✓] Playwright suite ${input} successfully executed.</div>`, delay: 0 }
                ], container, onDone);
            }
        },
        'log-analyzer': {
            cmd: './log-analyzer.sh',
            promptReq: 'Enter environment to analyze:',
            placeholder: 'production / staging / dev',
            simulate: (input, container, onDone) => {
                if (!input) input = 'production';
                animateLines([
                    { html: `<div class="output-line system-msg">[logs] Connecting to Elasticsearch cluster (${input})...</div>`, delay: 400 },
                    { html: `<div class="output-line system-msg">[logs] Querying last 24 hours of application logs...</div>`, delay: 600 },
                    { html: `<div class="output-line system-msg">[logs] Filtering for ERROR and FATAL severity levels...</div>`, delay: 500 },
                    { html: `<div class="output-line system-msg">[logs] Analyzing ${progressBar(30)}</div>`, delay: 400 },
                    { html: `<div class="output-line system-msg">[logs] Analyzing ${progressBar(70)}</div>`, delay: 400 },
                    { html: `<div class="output-line system-msg">[logs] Analyzing ${progressBar(100)}</div>`, delay: 300 },
                    { html: '<div class="output-line system-msg">[logs] Generating summary report...</div>', delay: 500 },
                    { html: '<div class="output-line system-msg">Top Error Frequencies:</div>', delay: 200 },
                    { html: '<div class="output-line system-msg">  1. ConnectionTimeout: DB cluster (142 occurrences)</div>', delay: 150 },
                    { html: '<div class="output-line system-msg">  2. NullReferenceException: PaymentService (89 occurrences)</div>', delay: 150 },
                    { html: '<div class="output-line system-msg">  3. 502 Bad Gateway: AuthProxy (23 occurrences)</div>', delay: 150 },
                    { html: `<div class="output-line success-msg">[✓] Report generated and sent to Slack #alerts channel.</div>`, delay: 0 }
                ], container, onDone);
            }
        }
    };

    const scriptItems = document.querySelectorAll('.script-item');
    const terminalOutput = document.getElementById('terminal-output');
    const guiOutput = document.getElementById('gui-output');
    
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
                <span class="prompt">></span> <input type="text" id="tool-input" placeholder="${script.placeholder}" autocomplete="off">
                <button id="run-btn">Run Script</button>
            </div>
            <div id="dynamic-output"></div>
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
            val = val.replace(/&/g, '&amp;')
                     .replace(/</g, '&lt;')
                     .replace(/>/g, '&gt;')
                     .replace(/"/g, '&quot;')
                     .replace(/'/g, '&#39;');

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
            scriptItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            const scriptKey = item.getAttribute('data-script');
            
            if (scriptKey === 'password-gen') {
                if (currentAnimation) { clearTimeout(currentAnimation); currentAnimation = null; }
                terminalOutput.style.display = 'none';
                guiOutput.style.display = 'flex';
                document.querySelector('.terminal-title').innerText = 'Password Generator App';
            } else {
                terminalOutput.style.display = 'block';
                guiOutput.style.display = 'none';
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
            guiTabs.forEach(t => t.classList.remove('active'));
            guiTabContents.forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
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
        "uncle", "voice", "water", "x-ray", "yacht", "zebra", "cloud", "storm", "light", "shadow",
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

    // Initial Generation
    generatePassword();
    generatePassphrase();
});
