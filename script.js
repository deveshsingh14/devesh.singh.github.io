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
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
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
        'yt-downloader': {
            cmd: 'python3 yt_downloader.py',
            promptReq: 'Enter YouTube URL:',
            placeholder: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
            simulate: (input, container, onDone) => {
                if (!input.includes('youtube.com') && !input.includes('youtu.be')) {
                    animateLines([
                        { html: '<div class="output-line error-msg">✗ Error: Invalid YouTube URL. Expected youtube.com or youtu.be link.</div>', delay: 200 },
                        { html: '<div class="output-line system-msg">Usage: python3 yt_downloader.py [URL]</div>', delay: 0 }
                    ], container, onDone);
                    return;
                }
                const videoId = input.includes('v=') ? input.split('v=')[1]?.split('&')[0] : input.split('/').pop();
                animateLines([
                    { html: `<div class="output-line system-msg">[yt-dlp] Analyzing URL: ${input}</div>`, delay: 600 },
                    { html: `<div class="output-line system-msg">[yt-dlp] Extracting video ID: ${videoId || 'dQw4w9WgXcQ'}...</div>`, delay: 500 },
                    { html: '<div class="output-line system-msg">[info] Available formats:</div>', delay: 300 },
                    { html: '<div class="output-line system-msg" style="opacity:.7">  • 1080p  mp4   │ 137+140  │ 24.8 MiB</div>', delay: 150 },
                    { html: '<div class="output-line system-msg" style="opacity:.7">  •  720p  mp4   │ 136+140  │ 14.2 MiB</div>', delay: 150 },
                    { html: '<div class="output-line system-msg" style="opacity:.7">  •  480p  mp4   │ 135+140  │  8.5 MiB</div>', delay: 150 },
                    { html: '<div class="output-line system-msg">[download] Selecting best quality: 1080p mp4</div>', delay: 700 },
                    { html: `<div class="output-line system-msg">[download] ${progressBar(0)}</div>`, delay: 300 },
                    { html: `<div class="output-line system-msg">[download] ${progressBar(25)}</div>`, delay: 350 },
                    { html: `<div class="output-line system-msg">[download] ${progressBar(50)}</div>`, delay: 300 },
                    { html: `<div class="output-line system-msg">[download] ${progressBar(75)}</div>`, delay: 350 },
                    { html: `<div class="output-line system-msg">[download] ${progressBar(100)}</div>`, delay: 400 },
                    { html: '<div class="output-line system-msg">[ffmpeg] Merging video + audio streams...</div>', delay: 600 },
                    { html: '<div class="output-line success-msg">[✓] Download complete → ~/Downloads/video_output.mp4 (24.8 MiB)</div>', delay: 0 }
                ], container, onDone);
            }
        },
        'pdf-converter': {
            cmd: 'python3 pdf_converter.py',
            promptReq: 'Enter file path to convert (PDF → DOCX):',
            placeholder: '~/documents/resume.pdf',
            simulate: (input, container, onDone) => {
                if (!input.endsWith('.pdf')) {
                    animateLines([
                        { html: '<div class="output-line error-msg">✗ Error: Input file must have a .pdf extension.</div>', delay: 200 },
                        { html: '<div class="output-line system-msg">Supported formats: .pdf → .docx</div>', delay: 0 }
                    ], container, onDone);
                    return;
                }
                const filename = input.split('/').pop().replace('.pdf', '');
                const pages = Math.floor(Math.random() * 15) + 3;
                animateLines([
                    { html: `<div class="output-line system-msg">[converter] Opening ${input}...</div>`, delay: 500 },
                    { html: `<div class="output-line system-msg">[converter] Detected ${pages} pages, PDF version 1.7</div>`, delay: 400 },
                    { html: '<div class="output-line system-msg">[converter] Extracting text layers...</div>', delay: 600 },
                    { html: '<div class="output-line system-msg">[converter] Parsing embedded fonts and images...</div>', delay: 500 },
                    { html: `<div class="output-line system-msg">[converter] Processing ${progressBar(0)}</div>`, delay: 300 },
                    { html: `<div class="output-line system-msg">[converter] Processing ${progressBar(35)}</div>`, delay: 350 },
                    { html: `<div class="output-line system-msg">[converter] Processing ${progressBar(70)}</div>`, delay: 300 },
                    { html: `<div class="output-line system-msg">[converter] Processing ${progressBar(100)}</div>`, delay: 400 },
                    { html: '<div class="output-line system-msg">[converter] Rebuilding document structure for DOCX...</div>', delay: 500 },
                    { html: `<div class="output-line success-msg">[✓] Saved: ~/${filename}.docx (${pages} pages converted)</div>`, delay: 0 }
                ], container, onDone);
            }
        },
        'data-scraper': {
            cmd: 'python3 auto_scraper.py',
            promptReq: 'Enter target URL to scrape:',
            placeholder: 'https://example.com/products',
            simulate: (input, container, onDone) => {
                if (!input.startsWith('http')) {
                    animateLines([
                        { html: '<div class="output-line error-msg">✗ Error: URL must start with http:// or https://</div>', delay: 0 }
                    ], container, onDone);
                    return;
                }
                const domain = input.replace(/https?:\/\//, '').split('/')[0];
                const rows = Math.floor(Math.random() * 400) + 50;
                animateLines([
                    { html: '<div class="output-line system-msg">[scraper] Launching headless Chromium (Playwright)...</div>', delay: 700 },
                    { html: `<div class="output-line system-msg">[scraper] Navigating to ${input}</div>`, delay: 600 },
                    { html: `<div class="output-line system-msg">[scraper] Waiting for page load on ${domain}...</div>`, delay: 500 },
                    { html: '<div class="output-line system-msg">[scraper] Page loaded — status 200 OK</div>', delay: 300 },
                    { html: '<div class="output-line system-msg">[scraper] Detecting page structure...</div>', delay: 400 },
                    { html: '<div class="output-line system-msg">[scraper] Found: 3 tables, 12 lists, 47 links</div>', delay: 350 },
                    { html: '<div class="output-line system-msg">[scraper] Extracting tabular data...</div>', delay: 500 },
                    { html: `<div class="output-line system-msg">[scraper] Rows collected: ${progressBar(0)}</div>`, delay: 250 },
                    { html: `<div class="output-line system-msg">[scraper] Rows collected: ${progressBar(40)}</div>`, delay: 300 },
                    { html: `<div class="output-line system-msg">[scraper] Rows collected: ${progressBar(80)}</div>`, delay: 250 },
                    { html: `<div class="output-line system-msg">[scraper] Rows collected: ${progressBar(100)}</div>`, delay: 350 },
                    { html: '<div class="output-line system-msg">[scraper] Cleaning duplicates and normalizing columns...</div>', delay: 400 },
                    { html: `<div class="output-line success-msg">[✓] Saved: scraped_data.csv (${rows} rows × 8 columns)</div>`, delay: 0 }
                ], container, onDone);
            }
        },
        'monkeytype': {
            cmd: 'python3 monkytype.py',
            promptReq: 'Press Enter to start the typing bot:',
            placeholder: '(press Enter or type "start")',
            simulate: (input, container, onDone) => {
                const wpm = Math.floor(Math.random() * 40) + 120;
                const acc = (Math.random() * 2 + 97.5).toFixed(1);
                const words = ['the', 'quick', 'brown', 'fox', 'jumps', 'over', 'a', 'lazy', 'dog', 'near', 'the', 'river', 'bank', 'while', 'birds', 'fly'];
                let wordStr = '';
                words.forEach((w, i) => {
                    wordStr += `<span style="color: #27c93f">${w}</span> `;
                });
                animateLines([
                    { html: '<div class="output-line system-msg">[bot] Initializing Playwright...</div>', delay: 500 },
                    { html: '<div class="output-line system-msg">[bot] Launching chromium (headless=false)...</div>', delay: 600 },
                    { html: '<div class="output-line system-msg">[bot] Navigating to https://monkeytype.com/...</div>', delay: 700 },
                    { html: '<div class="output-line system-msg">[bot] Accepting cookies...</div>', delay: 400 },
                    { html: '<div class="output-line system-msg">[bot] Waiting for DOM ready...</div>', delay: 500 },
                    { html: '<div class="output-line system-msg">[bot] Test mode: 30 seconds</div>', delay: 300 },
                    { html: '<div class="output-line system-msg">[bot] Starting typing automation ▊</div>', delay: 400 },
                    { html: `<div class="output-line system-msg" style="word-break:break-word">[bot] Typing: ${wordStr}</div>`, delay: 800 },
                    { html: `<div class="output-line system-msg">[bot] Progress: ${progressBar(30)}</div>`, delay: 500 },
                    { html: `<div class="output-line system-msg">[bot] Progress: ${progressBar(65)}</div>`, delay: 500 },
                    { html: `<div class="output-line system-msg">[bot] Progress: ${progressBar(100)}</div>`, delay: 400 },
                    { html: '<div class="output-line system-msg">[bot] Test complete! Extracting results...</div>', delay: 500 },
                    { html: `<div class="output-line success-msg" style="font-size:1em">[✓] Results → WPM: ${wpm} │ Accuracy: ${acc}% │ Raw: ${wpm + 8}</div>`, delay: 0 }
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
            // For monkeytype, allow empty input
            if (!val && scriptKey !== 'monkeytype') return;
            if (scriptKey === 'monkeytype' && !val) val = 'start';
            
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
        item.addEventListener('click', () => {
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
                document.querySelector('.terminal-title').innerText = 'user@dsb-macbook: ~/automation-scripts';
                // Render corresponding terminal UI
                renderTerminal(scriptKey);
            }
        });
    });

    // Initialize first script
    renderTerminal('yt-downloader');

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

    function generatePassword() {
        const length = parseInt(pgLength.value);
        const useUpper = pgUpper.checked;
        const useLower = pgLower.checked;
        const useNums = pgNums.checked;
        const useSyms = pgSyms.checked;
        const avoidAmbig = pgAmbig.checked;
        
        const minNums = parseInt(pgMinNums.value) || 0;
        const minSyms = parseInt(pgMinSyms.value) || 0;

        let upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let lowerChars = "abcdefghijklmnopqrstuvwxyz";
        let numChars = "0123456789";
        let symChars = "!@#$%^&*";
        const ambiguousChars = "l1IO0";

        if (avoidAmbig) {
            upperChars = upperChars.split('').filter(c => !ambiguousChars.includes(c)).join('');
            lowerChars = lowerChars.split('').filter(c => !ambiguousChars.includes(c)).join('');
            numChars = numChars.split('').filter(c => !ambiguousChars.includes(c)).join('');
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
                passwordChars.push(numChars[Math.floor(Math.random() * numChars.length)]);
            }
        }
        
        if (useSyms && minSyms > 0) {
            for (let i = 0; i < Math.min(minSyms, length - passwordChars.length); i++) {
                passwordChars.push(symChars[Math.floor(Math.random() * symChars.length)]);
            }
        }

        const remainingLength = length - passwordChars.length;
        for (let i = 0; i < remainingLength; i++) {
            passwordChars.push(pool[Math.floor(Math.random() * pool.length)]);
        }

        // Shuffle
        for (let i = passwordChars.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
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
            let word = wordlist[Math.floor(Math.random() * wordlist.length)];
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
    
    pgRefresh.addEventListener('click', generatePassword);
    pgCopy.addEventListener('click', () => {
        navigator.clipboard.writeText(pgResult.value);
        pgCopy.innerText = "Copied!";
        setTimeout(() => pgCopy.innerText = "Copy", 2000);
    });

    ppWords.addEventListener('input', (e) => {
        ppWordsLabel.innerText = `Number of words: ${e.target.value}`;
        generatePassphrase();
    });

    [ppSep, ppCap].forEach(el => {
        el.addEventListener('change', generatePassphrase);
        el.addEventListener('input', generatePassphrase);
    });
    
    ppRefresh.addEventListener('click', generatePassphrase);
    ppCopy.addEventListener('click', () => {
        navigator.clipboard.writeText(ppResult.value);
        ppCopy.innerText = "Copied!";
        setTimeout(() => ppCopy.innerText = "Copy", 2000);
    });

    // Initial Generation
    generatePassword();
    generatePassphrase();
});
