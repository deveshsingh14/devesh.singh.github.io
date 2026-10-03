import { formatUptime } from './ops-dashboard.js';

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
