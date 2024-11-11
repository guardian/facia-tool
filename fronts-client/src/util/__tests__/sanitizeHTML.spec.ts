import { sanitizeHTML } from 'util/sanitizeHTML';

describe('sanitizeHTML', () => {
	it('removes unwanted / unsafe tags', () => {
		expect(
			sanitizeHTML('<p>Iframe: <iframe src="http://test.com" /></p>'),
		).toBe('<p>Iframe: </p>');

		expect(
			sanitizeHTML('<p>Script</p><script>window.alert("hacked")</script>'),
		).toBe('<p>Script</p>');
	});
});
