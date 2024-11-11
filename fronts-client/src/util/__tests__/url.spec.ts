import { isValidSnapLinkUrl } from 'util/url';

describe('URL utils', () => {
	describe('isValidLink', () => {
		it('should allow URLs with http(s) protocol', () => {
			expect(isValidSnapLinkUrl('https://www.theguardian.com/uk')).toBe(true);
			expect(isValidSnapLinkUrl('http://www.theguardian.com/uk')).toBe(true);
		});
		it('should not allow URLs without http(s) protocol', () => {
			expect(isValidSnapLinkUrl('mailto:max@provider.com')).toBe(false);
			expect(
				isValidSnapLinkUrl(
					"%28function%28%29%7Bdocument.body.appendchild%28document.createelement%28%27script%27%29%29.src%3D%27https//dashboard.ophan.co.uk/assets/js/heatmap-bookmarklet.js';%7D)();",
				),
			).toBe(false);
		});
		it('should not allow other invalid URLs', () => {
			expect(isValidSnapLinkUrl('notaurl.com')).toBe(false);
		});
	});
});
