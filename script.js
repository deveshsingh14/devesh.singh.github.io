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

    // Interactive Terminal UI Logic
    const scripts = {
        'yt-downloader': {
            cmd: 'python3 yt_downloader.py',
            promptReq: 'Enter YouTube URL:',
            placeholder: 'https://youtube.com/watch?v=...',
            simulate: (input) => {
                if(!input.includes('youtube.com') && !input.includes('youtu.be')) {
                    return `<div class="output-line error-msg">Error: Invalid YouTube URL format.</div>`;
                }
                return `
                    <div class="output-line system-msg">Analyzing URL: ${input}</div>
                    <div class="output-line system-msg">Fetching video streams...</div>
                    <div class="output-line system-msg">Downloading highest resolution (1080p)...</div>
                    <div class="output-line success-msg">[✓] Download complete: video_output.mp4</div>
                `;
            }
        },
        'pdf-converter': {
            cmd: 'python3 pdf_converter.py',
            promptReq: 'Enter file path to convert (PDF -> DOCX):',
            placeholder: '~/documents/resume.pdf',
            simulate: (input) => {
                if(!input.endsWith('.pdf')) {
                    return `<div class="output-line error-msg">Error: File must be a .pdf</div>`;
                }
                const filename = input.split('/').pop().replace('.pdf', '');
                return `
                    <div class="output-line system-msg">Reading ${input}...</div>
                    <div class="output-line system-msg">Extracting text and formatting...</div>
                    <div class="output-line success-msg">[✓] Conversion successful: ${filename}.docx saved.</div>
                `;
            }
        },
        'data-scraper': {
            cmd: 'python3 auto_scraper.py',
            promptReq: 'Enter target URL to scrape:',
            placeholder: 'https://example.com',
            simulate: (input) => {
                if(!input.startsWith('http')) {
                    return `<div class="output-line error-msg">Error: Please enter a valid HTTP/HTTPS URL.</div>`;
                }
                return `
                    <div class="output-line system-msg">Initializing headless browser...</div>
                    <div class="output-line system-msg">Navigating to ${input}...</div>
                    <div class="output-line system-msg">Extracting DOM nodes and tabular data...</div>
                    <div class="output-line success-msg">[✓] Data scraped and saved to scraped_data.csv (243 rows).</div>
                `;
            }
        },
        'monkeytype': {
            cmd: 'python3 monkytype.py',
            promptReq: 'Press Enter to start typing bot:',
            placeholder: '(No input required)',
            simulate: (input) => {
                return `
                    <div class="output-line system-msg">Initializing Playwright...</div>
                    <div class="output-line system-msg">Launching chromium browser...</div>
                    <div class="output-line system-msg">Navigating to https://monkeytype.com/...</div>
                    <div class="output-line system-msg">Waiting 5 seconds for page to load and cookies to be accepted...</div>
                    <div class="output-line system-msg">Starting the typing automation!</div>
                    <div class="output-line system-msg">Extracting words and typing...</div>
                    <div class="output-line success-msg">[✓] Test finished! Look at that speed.</div>
                `;
            }
        }
    };

    const scriptItems = document.querySelectorAll('.script-item');
    const terminalOutput = document.getElementById('terminal-output');
    const guiOutput = document.getElementById('gui-output');
    
    // Function to render the initial state of a script
    const renderTerminal = (scriptKey) => {
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
            const val = inputField.value.trim();
            if(!val) return;
            
            // Disable input while running
            inputField.disabled = true;
            runBtn.disabled = true;
            runBtn.innerText = 'Running...';
            
            dynamicOutput.innerHTML = `<div class="output-line system-msg">Executing...</div>`;
            
            // Simulate processing delay
            setTimeout(() => {
                dynamicOutput.innerHTML = scripts[scriptKey].simulate(val);
                inputField.disabled = false;
                runBtn.disabled = false;
                runBtn.innerText = 'Run Script';
                inputField.value = '';
            }, 1500);
        };

        runBtn.addEventListener('click', executeSim);
        inputField.addEventListener('keypress', (e) => {
            if(e.key === 'Enter') executeSim();
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
        pgLengthLabel.innerText = \`Length: \${e.target.value}\`;
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
        ppWordsLabel.innerText = \`Number of words: \${e.target.value}\`;
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
