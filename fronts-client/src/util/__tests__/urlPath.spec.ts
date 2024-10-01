import { getAbsolutePath } from 'util/url';

describe('utils/url-abs-path', () => {
	it('extracts the path name', () => {
		expect(getAbsolutePath('banana')).toBe('banana');
		expect(getAbsolutePath('banana?peel=from-top')).toBe('banana');
		expect(getAbsolutePath('/banana#handle')).toBe('banana');
		expect(getAbsolutePath('https://anotherurl.com/banana#handle')).toBe(
			'banana',
		);
		expect(
			getAbsolutePath('https://anotherurl.com/banana/for/free?q=hello'),
		).toBe('banana/for/free');
		expect(
			getAbsolutePath('https://anotherurl.com/banana/for/free?q=hello', true),
		).toBe('banana/for/free?q=hello');
	});
});
