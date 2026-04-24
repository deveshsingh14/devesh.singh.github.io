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
        }
    };

    const scriptItems = document.querySelectorAll('.script-item');
    const terminalOutput = document.getElementById('terminal-output');
    
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
            
            // Render corresponding terminal UI
            const scriptKey = item.getAttribute('data-script');
            renderTerminal(scriptKey);
        });
    });

    // Initialize first script
    renderTerminal('yt-downloader');
});
