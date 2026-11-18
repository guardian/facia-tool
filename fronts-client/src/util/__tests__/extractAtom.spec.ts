import {
	extractFirstSlideshowImage,
	extractMultimediaSlideshowAtomId,
} from '../extractAtom';
import type { Atom } from '../../types/Capi';

describe('extractMultimediaSlideshowAtomId', () => {
	const atomId = 'atom/multimediaslideshow/a1b2c3';

	it('extracts the CAPI atom id from an Atom Workshop URL', () => {
		expect(
			extractMultimediaSlideshowAtomId(
				'https://atomworkshop.gutools.co.uk/atoms/multimediaslideshow/a1b2c3/edit',
			),
		).toEqual(atomId);
	});

	it('extracts the CAPI atom id from a CAPI URL, ignoring query params', () => {
		expect(
			extractMultimediaSlideshowAtomId(
				'https://content.guardianapis.com/atom/multimediaslideshow/a1b2c3?api-key=test',
			),
		).toEqual(atomId);
	});

	it('extracts the CAPI atom id from an embed URL', () => {
		expect(
			extractMultimediaSlideshowAtomId(
				'https://embed.theguardian.com/embed/atom/multimediaslideshow/a1b2c3',
			),
		).toEqual(atomId);
	});

	it('returns an empty string for URLs without a slideshow atom', () => {
		expect(
			extractMultimediaSlideshowAtomId(
				'https://content.guardianapis.com/atom/media/a1b2c3',
			),
		).toEqual('');
		expect(extractMultimediaSlideshowAtomId(undefined)).toEqual('');
	});
});

const atomWithFirstSlideImage = (
	assetFile?: string,
	masterFile?: string,
): Atom => ({
	id: 'atom-id',
	atomType: 'multimediaslideshow',
	data: {
		multimediaSlideshow: {
			slides: [
				{
					content: {
						image: {
							assets: assetFile ? [{ file: assetFile } as any] : ([] as any),
							master: masterFile ? ({ file: masterFile } as any) : undefined,
						},
					},
				},
			],
		},
	},
});

describe('extractFirstSlideshowImage', () => {
	it('returns the master image file when present', () => {
		const atom = atomWithFirstSlideImage('asset.jpg', 'master.jpg');
		expect(extractFirstSlideshowImage(atom)).toEqual('master.jpg');
	});

	it('falls back to the first asset file when there is no master', () => {
		const atom = atomWithFirstSlideImage('asset.jpg');
		expect(extractFirstSlideshowImage(atom)).toEqual('asset.jpg');
	});

	it('skips video slides to find the first image', () => {
		const atom: Atom = {
			id: 'atom-id',
			atomType: 'multimediaslideshow',
			data: {
				multimediaSlideshow: {
					slides: [
						{ content: { mediaAtom: { mediaAtomId: 'media-1' } } },
						{
							content: {
								image: { assets: [], master: { file: 'second.jpg' } as any },
							},
						},
					],
				},
			},
		};
		expect(extractFirstSlideshowImage(atom)).toEqual('second.jpg');
	});

	it('returns undefined when no slide has an image', () => {
		const atom: Atom = {
			id: 'atom-id',
			atomType: 'multimediaslideshow',
			data: {
				multimediaSlideshow: {
					slides: [{ content: { mediaAtom: { mediaAtomId: 'media-1' } } }],
				},
			},
		};
		expect(extractFirstSlideshowImage(atom)).toBeUndefined();
	});

	it('returns undefined when there are no slides', () => {
		const atom: Atom = {
			id: 'atom-id',
			atomType: 'multimediaslideshow',
			data: { multimediaSlideshow: { slides: [] } },
		};
		expect(extractFirstSlideshowImage(atom)).toBeUndefined();
	});

	it('returns undefined for a non-slideshow atom', () => {
		const atom: Atom = {
			id: 'atom-id',
			atomType: 'media',
			data: {},
		};
		expect(extractFirstSlideshowImage(atom)).toBeUndefined();
	});
});
