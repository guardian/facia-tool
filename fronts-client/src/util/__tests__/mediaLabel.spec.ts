import { getMediaLabel } from '../mediaLabel';

describe('media label utilities', () => {
	it('constructs labels correctly for cutouts', () => {
		// Cutout can only have a placement type of replaced
		expect(getMediaLabel('cutout', 'replaced', null)).toEqual(
			'Cutout replaced',
		);

		expect(getMediaLabel('cutout', 'main', null)).toBeNull();

		expect(getMediaLabel('cutout', 'added', null)).toBeNull();
	});

	it('constructs labels correctly for images', () => {
		expect(getMediaLabel('image', 'main', null)).toEqual('Main image');

		// Image can't have a placement type of added
		expect(getMediaLabel('image', 'added', null)).toBeNull();

		expect(getMediaLabel('image', 'replaced', null)).toEqual('Image replaced');
	});

	it('constructs labels correctly for slideshows', () => {
		expect(getMediaLabel('slideshow', 'main', null)).toBeNull();

		// Cutout can only have a placement type of added
		expect(getMediaLabel('slideshow', 'added', null)).toEqual('Slideshow');

		expect(getMediaLabel('slideshow', 'replaced', null)).toBeNull();
	});

	it('constructs labels correctly for loops', () => {
		expect(getMediaLabel('video', 'main', 'Loop')).toEqual('Main Loop');

		expect(getMediaLabel('video', 'added', 'Loop')).toEqual('Loop');

		expect(getMediaLabel('video', 'replaced', 'Loop')).toEqual('Loop replaced');
	});

	it('constructs labels correctly for cinemagraphs', () => {
		expect(getMediaLabel('video', 'main', 'Cinemagraph')).toEqual(
			'Main Cinemagraph',
		);

		expect(getMediaLabel('video', 'added', 'Cinemagraph')).toEqual(
			'Cinemagraph',
		);

		expect(getMediaLabel('video', 'replaced', 'Cinemagraph')).toEqual(
			'Cinemagraph replaced',
		);
	});

	it('constructs labels correctly for YouTube videos', () => {
		expect(getMediaLabel('video', 'main', 'YouTube')).toEqual('Main YouTube');

		expect(getMediaLabel('video', 'added', 'YouTube')).toEqual('YouTube');

		expect(getMediaLabel('video', 'replaced', 'YouTube')).toEqual(
			'YouTube replaced',
		);
	});

	it('constructs labels correctly for Non-YouTube videos', () => {
		expect(getMediaLabel('video', 'main', 'Non-YouTube')).toEqual(
			'Main Non-YouTube',
		);

		expect(getMediaLabel('video', 'added', 'Non-YouTube')).toEqual(
			'Non-YouTube',
		);

		expect(getMediaLabel('video', 'replaced', 'Non-YouTube')).toEqual(
			'Non-YouTube replaced',
		);
	});

	it("won't construct a video label without a videoFormatType", () => {
		expect(getMediaLabel('video', 'main', null)).toBeNull();

		expect(getMediaLabel('video', 'replaced', null)).toBeNull();

		expect(getMediaLabel('video', 'added', null)).toBeNull();
	});

	it("won't construct a non-video label if a videoFormatType is provided", () => {
		expect(getMediaLabel('cutout', 'added', 'Non-YouTube')).toBeNull();

		expect(getMediaLabel('image', 'main', 'YouTube')).toBeNull();

		expect(getMediaLabel('slideshow', 'replaced', 'Loop')).toBeNull();
	});
});
