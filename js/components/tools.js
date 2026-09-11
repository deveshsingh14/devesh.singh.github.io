import { escapeHtml } from '../utils/dom.js';

export function initTools() {
    let currentAnimation = null;
    const guiBodies = document.querySelectorAll('.gui-body');

    const animateLines = (lines, container, onDone) => {
        let i = 0;
        const next = () => {
            if (i >= lines.length) { if (onDone) onDone(); return; }
            const { html, delay } = lines[i];
            if (typeof DOMPurify === 'undefined') {
                throw new Error("Security check failed: DOMPurify failed to load. Please check your internet connection.");
            }
            const div = document.createElement('div');
            div.innerHTML = DOMPurify.sanitize(html);
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

    const progressBar = (pct) => {
        const filled = Math.round(pct / 5);
        const empty = 20 - filled;
        return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${pct}%`;
    };

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

    const renderTerminal = (scriptKey, focusInput = false) => {
        if (currentAnimation) { clearTimeout(currentAnimation); currentAnimation = null; }

        const script = scripts[scriptKey];
        if(!terminalOutput || !script) return;
        terminalOutput.innerHTML = `
            <div class="output-line"><span class="prompt" aria-hidden="true">$</span> <span class="command">${script.cmd}</span></div>
            <div class="output-line system-msg">Loading dependencies...</div>
            <div class="output-line prompt-req">${script.promptReq}</div>
            <div class="interactive-input" aria-live="polite">
                <span class="prompt" aria-hidden="true">></span> <input type="text" id="tool-input" placeholder="${script.placeholder}" autocomplete="off" aria-label="Terminal command input">
                <button id="run-btn">Run Script</button>
            </div>
            <div id="dynamic-output" aria-live="polite"></div>
        `;
        attachRunEvent(scriptKey);

        if (focusInput) {
            const toolInput = document.getElementById('tool-input');
            if (toolInput) toolInput.focus({ preventScroll: true });
        }
    };

    const attachRunEvent = (scriptKey) => {
        const runBtn = document.getElementById('run-btn');
        const inputField = document.getElementById('tool-input');
        const dynamicOutput = document.getElementById('dynamic-output');

        if (inputField) {
            inputField.focus({ preventScroll: true });
        }

        const executeSim = () => {
            let val = inputField.value.trim();
            val = escapeHtml(val);

            inputField.disabled = true;
            runBtn.disabled = true;
            runBtn.innerHTML = '<span class="spinner"></span> Running…';
            runBtn.classList.add('running');

            dynamicOutput.innerHTML = '';

            scripts[scriptKey].simulate(val, dynamicOutput, () => {
                inputField.disabled = false;
                runBtn.disabled = false;
                runBtn.innerText = 'Run Script';
                runBtn.classList.remove('running');
                inputField.value = '';
                inputField.focus();
            });
        };

        if(runBtn) runBtn.addEventListener('click', executeSim);
        if(inputField) inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') executeSim();
        });
    };

    scriptItems.forEach(item => {
        const selectScript = () => {
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
                guiBodies.forEach(el => el.style.display = 'none');
                document.getElementById('gui-output-password').style.display = 'flex';
                document.querySelector('.terminal-title').innerText = 'Password Generator App';

                const pgResult = document.getElementById('pg-result');
                const ppResult = document.getElementById('pp-result');
                const tabPassphrase = document.getElementById('tab-passphrase');
                const isPassphraseActive = tabPassphrase && tabPassphrase.classList.contains('active');
                if (isPassphraseActive && ppResult) {
                    ppResult.focus({ preventScroll: true });
                } else if (pgResult) {
                    pgResult.focus({ preventScroll: true });
                }
            } else if (scriptKey === 'docx-to-pdf') {
                if (currentAnimation) { clearTimeout(currentAnimation); currentAnimation = null; }
                terminalOutput.style.display = 'none';
                guiBodies.forEach(el => el.style.display = 'none');
                document.getElementById('gui-output-docx').style.display = 'flex';
                document.querySelector('.terminal-title').innerText = 'DOCX to PDF Converter';

                const docxUploadArea = document.getElementById('docx-upload-area');
                if (docxUploadArea) docxUploadArea.focus({ preventScroll: true });
            } else {
                guiBodies.forEach(el => el.style.display = 'none');
                terminalOutput.style.display = 'block';
                document.querySelector('.terminal-title').innerText = 'user@dsb-macbook: ~/devops-tools';
                renderTerminal(scriptKey, true);
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

    if(scriptItems.length > 0) {
        renderTerminal('k8s-deploy');
    }

    // Password Generator
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

            if (tab.id === 'tab-password') {
                const pgResult = document.getElementById('pg-result');
                if (pgResult) pgResult.focus({ preventScroll: true });
            } else if (tab.id === 'tab-passphrase') {
                const ppResult = document.getElementById('pp-result');
                if (ppResult) ppResult.focus({ preventScroll: true });
            }
        });
    });

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

    function createPasswordString(options) {
        const { length, useUpper, useLower, useNums, useSyms, avoidAmbig, minNums, minSyms } = options;

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

        if (!pool) return { error: "Select at least one character set." };

        let passwordChars = [];

        function pushRandomChars(condition, minCount, charSet) {
            if (condition && minCount > 0) {
                const limit = Math.min(minCount, length - passwordChars.length);
                for (let i = 0; i < limit; i++) {
                    passwordChars.push(getRandomChar(charSet));
                }
            }
        }

        pushRandomChars(useNums, minNums, numChars);
        pushRandomChars(useSyms, minSyms, symChars);

        const remainingLength = length - passwordChars.length;
        for (let i = 0; i < remainingLength; i++) {
            passwordChars.push(getRandomChar(pool));
        }

        for (let i = passwordChars.length - 1; i > 0; i--) {
            const j = Math.floor(getSecureRandom() * (i + 1));
            [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
        }

        return { password: passwordChars.join('').substring(0, length) };
    }

    function generatePassword() {
        if (!pgLength) return;
        const result = createPasswordString({
            length: parseInt(pgLength.value),
            useUpper: pgUpper.checked,
            useLower: pgLower.checked,
            useNums: pgNums.checked,
            useSyms: pgSyms.checked,
            avoidAmbig: pgAmbig.checked,
            minNums: parseInt(pgMinNums.value) || 0,
            minSyms: parseInt(pgMinSyms.value) || 0
        });

        const announcer = document.getElementById('pg-announcer');
        if (result.error) {
            pgResult.value = result.error;
            if (announcer) announcer.textContent = result.error;
        } else {
            pgResult.value = result.password;
            if (announcer) announcer.textContent = result.password;
        }
    }

    function generatePassphrase() {
        if (!ppWords) return;
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

        const passphrase = words.join(separator);
        ppResult.value = passphrase;
        const announcer = document.getElementById('pp-announcer');
        if (announcer) announcer.textContent = passphrase;
    }

    if (pgLength) {
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

        const autoSelectText = (e) => e.target.select();
        [pgResult, ppResult].forEach(el => {
            el.addEventListener('click', autoSelectText);
            el.addEventListener('focus', autoSelectText);
        });

        generatePassword();
        generatePassphrase();
    }

    // DOCX to PDF Logic
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
                let htmlContent = result.value;
                if (typeof DOMPurify === 'undefined') {
                    throw new Error("Security check failed: DOMPurify failed to load. Please check your internet connection.");
                }
                htmlContent = DOMPurify.sanitize(htmlContent);
                docxPreview.innerHTML = `<div style="padding: 40px; color: #000; background: #fff; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6;">${htmlContent}</div>`;

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
}
document.addEventListener('DOMContentLoaded', initTools);
