import { jest } from '@jest/globals';
import { formatUptime, initOpsDashboard } from './ops-dashboard.js';

describe('ops dashboard pipeline', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <section id="ops"></section>
            <button id="run-pipeline">Run Pipeline</button>
            <p id="pipeline-status"></p>
            <div id="pipeline-log"></div>
            <div class="pipeline-stage" data-stage="build"></div>
            <div class="pipeline-stage" data-stage="test"></div>
            <div class="pipeline-stage" data-stage="scan"></div>
            <div class="pipeline-stage" data-stage="deploy"></div>
            <div class="pipeline-connector"></div>
            <div class="pipeline-connector"></div>
            <div class="pipeline-connector"></div>

            <div id="metric-cpu-value"></div>
            <div id="metric-cpu-fill"></div>
            <div id="metric-mem-value"></div>
            <div id="metric-mem-fill"></div>
            <div id="metric-uptime"></div>
            <div id="metric-deployments"></div>
            <div id="metric-coffee"></div>
        `;

        global.DOMPurify = {
            sanitize: (html, options) => {
                if (options && options.RETURN_DOM_FRAGMENT) {
                    const template = document.createElement('template');
                    template.innerHTML = html;
                    return template.content;
                }
                return html;
            }
        };
        global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 0));
        global.IntersectionObserver = jest.fn(function() {
            this.observe = jest.fn();
            this.disconnect = jest.fn();
        });

        jest.useFakeTimers({ advanceTimers: true });
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
        delete global.DOMPurify;
        delete global.requestAnimationFrame;
        delete global.IntersectionObserver;
    });

    it('triggers the scan retry logic when shouldScanFailThisRun is true', () => {
        const mathRandomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.1); // < 0.2 forces fail

        try {
            initOpsDashboard();
            const runBtn = document.getElementById('run-pipeline');
            runBtn.click();

            // Advance timers enough to let the whole pipeline finish
            for (let i = 0; i < 50; i++) {
                jest.advanceTimersByTime(1000);
            }

            const scanStage = document.querySelector('.pipeline-stage[data-stage="scan"]');
            const pipelineStatus = document.getElementById('pipeline-status');

            // Should reach deployment complete
            expect(pipelineStatus.textContent).toBe('Deployment complete. All stages green.');
            expect(scanStage.getAttribute('data-status')).toBe('success');

            // Verify SCAN_RETRY_LOGS were inserted
            const logContainer = document.getElementById('pipeline-log');
            expect(logContainer.innerHTML).toContain('Vulnerable dependency detected');
        } finally {
            mathRandomSpy.mockRestore();
        }
    });
});

describe('formatUptime', () => {
    it('formats a standard uptime correctly', () => {
        // 1 day = 86400000 ms, 1 hour = 3600000 ms, 1 min = 60000 ms, 1 sec = 1000 ms
        const ms = 86400000 + 3600000 + 60000 + 1000;
        expect(formatUptime(ms)).toBe('01d 01:01:01');
    });

    it('formats 0 milliseconds correctly', () => {
        expect(formatUptime(0)).toBe('00d 00:00:00');
    });

    it('formats negative inputs correctly as 00d 00:00:00', () => {
        expect(formatUptime(-5000)).toBe('00d 00:00:00');
    });

    it('formats invalid inputs correctly as 00d 00:00:00', () => {
        expect(formatUptime(NaN)).toBe('00d 00:00:00');
        expect(formatUptime('invalid')).toBe('00d 00:00:00');
        expect(formatUptime(undefined)).toBe('00d 00:00:00');
        expect(formatUptime(null)).toBe('00d 00:00:00'); // null converts to 0, which is handled
        expect(formatUptime({})).toBe('00d 00:00:00');
    });
});
