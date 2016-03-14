import parseJson from 'utils/lenient-json-parse';

describe('Lenient Json parse', function () {
    it('recovers one error', function () {
        const original = {
            message: 'banana'
        };
        const json = JSON.stringify(original)
            .replace('banana', 'ban' + String.fromCharCode(0x10) + 'ana');

        try {
            JSON.parse(json);
            fail('Expecting JSON.parse to throw an error');
        } catch (ex) {
            if (!ex.message.match(/unterminated string/i)) {
                const parsed = parseJson(json);
                expect(parsed.json).toEqual(original);
                expect(parsed.errors.length).toBe(1);
                expect(parsed.errors[0]).toMatch(/message.*'ban'.*'ana'/i);
            }
        }
    });

    it('recovers multiple errors', function () {
        const original = {
            results: [{
                one: 'banana'
            }, {
                two: 'apple'
            }]
        };
        const json = JSON.stringify(original)
            .replace('banana', 'ban' + String.fromCharCode(0x10) + 'ana')
            .replace('apple', 'ap' + String.fromCharCode(0x5) + 'ple');

        try {
            JSON.parse(json);
            fail('Expecting JSON.parse to throw an error');
        } catch (ex) {
            if (!ex.message.match(/unterminated string/i)) {
                const parsed = parseJson(json);
                expect(parsed.json).toEqual(original);
                expect(parsed.errors.length).toBe(2);
                expect(parsed.errors[0]).toMatch(/one.*'ban'.*'ana'/i);
                expect(parsed.errors[1]).toMatch(/two.*'ap'.*'ple'/i);
            }
        }
    });

    it('recovers on key symbols', function () {
        const original = {
            fruit: 'pear'
        };
        const json = JSON.stringify(original)
            .replace('fruit', 'fru' + String.fromCharCode(0x10) + 'it');

        try {
            JSON.parse(json);
            fail('Expecting JSON.parse to throw an error');
        } catch (ex) {
            if (!ex.message.match(/unterminated string/i)) {
                const parsed = parseJson(json);
                expect(parsed.json).toEqual(original);
                expect(parsed.errors.length).toBe(1);
                expect(parsed.errors[0]).toMatch(/symbol.*'fru'.*'it'/i);
            }
        }
    });

    it('doesn\'t recover on invalid json', function () {
        const json = 'string';

        try {
            JSON.parse(json);
            fail('Expecting JSON.parse to throw an error');
        } catch (ex) {
            if (!ex.message.match(/unterminated string/i)) {
                const parsed = parseJson(json);
                expect(parsed.json).toBeUndefined();
            }
        }
    });
});
