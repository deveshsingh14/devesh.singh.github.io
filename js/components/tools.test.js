import { jest } from '@jest/globals';
import { createPasswordString } from './tools.js';

describe('createPasswordString', () => {
    let originalCrypto;

    beforeEach(() => {
        let mockValues = [123456789, 987654321, 111111111, 222222222, 333333333, 444444444, 555555555, 666666666];
        let mockIndex = 0;
        jest.spyOn(window.crypto, 'getRandomValues').mockImplementation((arr) => {
            for (let i = 0; i < arr.length; i++) {
                arr[i] = mockValues[mockIndex % mockValues.length];
                mockIndex++;
            }
            return arr;
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns an error if no character sets are selected', () => {
        const options = {
            length: 12,
            useUpper: false,
            useLower: false,
            useNums: false,
            useSyms: false,
            avoidAmbig: false,
            minNums: 0,
            minSyms: 0
        };
        const result = createPasswordString(options);
        expect(result.error).toBe("Select at least one character set.");
    });
    it('generates a password with correct length', () => {
        const options = {
            length: 15,
            useUpper: true,
            useLower: true,
            useNums: true,
            useSyms: true,
            avoidAmbig: false,
            minNums: 0,
            minSyms: 0
        };
        const result = createPasswordString(options);
        expect(result.password).toBeDefined();
        expect(result.password.length).toBe(15);
    });

    it('generates a password with only uppercase letters', () => {
        const options = {
            length: 10,
            useUpper: true,
            useLower: false,
            useNums: false,
            useSyms: false,
            avoidAmbig: false,
            minNums: 0,
            minSyms: 0
        };
        const result = createPasswordString(options);
        expect(result.password).toMatch(/^[A-Z]+$/);
        expect(result.password.length).toBe(10);
    });

    it('avoids ambiguous characters when avoidAmbig is true', () => {
        const options = {
            length: 100, // Make it long to increase chance of hitting all characters
            useUpper: true,
            useLower: true,
            useNums: true,
            useSyms: false,
            avoidAmbig: true,
            minNums: 0,
            minSyms: 0
        };

        // We might need to make getRandomValues less deterministic for this test to be meaningful,
        // or we just test the logic that filters the characters. Let's run it multiple times with
        // different deterministic values to ensure it works.
        const AMBIGUOUS_CHARS = "l1IO0";
        const result = createPasswordString(options);

        for (const char of AMBIGUOUS_CHARS) {
            expect(result.password.includes(char)).toBe(false);
        }
    });

    it('includes minimum number of numbers', () => {
        const options = {
            length: 10,
            useUpper: true,
            useLower: false,
            useNums: true,
            useSyms: false,
            avoidAmbig: false,
            minNums: 4,
            minSyms: 0
        };
        const result = createPasswordString(options);
        const nums = result.password.match(/[0-9]/g) || [];
        expect(nums.length).toBeGreaterThanOrEqual(4);
    });

    it('includes minimum number of symbols', () => {
        const options = {
            length: 10,
            useUpper: true,
            useLower: false,
            useNums: false,
            useSyms: true,
            avoidAmbig: false,
            minNums: 0,
            minSyms: 3
        };
        const result = createPasswordString(options);
        const syms = result.password.match(/[!@#$%^&*]/g) || [];
        expect(syms.length).toBeGreaterThanOrEqual(3);
    });
});
