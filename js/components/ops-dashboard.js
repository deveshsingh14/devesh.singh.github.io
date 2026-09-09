import { typeLines } from '../utils/dom.js';

export function formatUptime(ms) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(days)}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
window.formatUptime = formatUptime;

export function initOpsDashboard() {
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

    const metricCpuValue = document.getElementById('metric-cpu-value');
    const metricCpuFill = document.getElementById('metric-cpu-fill');
    const metricMemValue = document.getElementById('metric-mem-value');
    const metricMemFill = document.getElementById('metric-mem-fill');
    const metricUptime = document.getElementById('metric-uptime');
    const metricDeployments = document.getElementById('metric-deployments');
    const metricCoffee = document.getElementById('metric-coffee');

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
}
document.addEventListener('DOMContentLoaded', initOpsDashboard);
