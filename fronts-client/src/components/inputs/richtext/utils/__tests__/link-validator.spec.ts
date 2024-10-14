import * as fc from 'fast-check';
import { linkValidator, parseURL } from '../link-validator';

const parse = (url: string, agreeable: boolean) => {
	return parseURL(url, () => agreeable);
};

describe('Validate links', () => {
	it('for any arbitrary valid link (with protocol prefix), return valid', () => {
		fc.assert(
			fc.property(fc.webUrl(), (url) => {
				expect(linkValidator(url).valid).toBe(true);
			}),
		);
	});
	it('for any arbitrary valid domain (without protocol prefix), return valid', () => {
		fc.assert(
			fc.property(fc.domain(), (domain) => {
				expect(linkValidator(domain).valid).toBe(true);
			}),
		);
	});
	it('for any arbitrary non-link string, return invalid', () => {
		fc.assert(
			fc.property(fc.hexaString(0, 1000), (str) => {
				expect(linkValidator(str).valid).toBe(false);
				expect(linkValidator(str).message).toBe(
					`"${str}" is not a valid url, please check and try again`,
				);
			}),
		);
	});
});

describe('Parse potential link types', () => {
	it('should identify and parse email addresses', () => {
		fc.assert(
			fc.property(fc.emailAddress(), (email) => {
				expect(parse(email, true)).toBe(`mailto:${email}`);
			}),
		);
	});
	it('should identify and parse phone numbers', () => {
		fc.assert(
			fc.property(fc.nat(), (phoneNumber) => {
				expect(parse(phoneNumber.toString(), true)).toBe(`tel:${phoneNumber}`);
			}),
		);
	});
	it('should identify and parse web domains', () => {
		fc.assert(
			fc.property(fc.domain(), (domain) => {
				expect(parse(domain, true)).toBe(`http://${domain}`);
			}),
		);
	});
});
