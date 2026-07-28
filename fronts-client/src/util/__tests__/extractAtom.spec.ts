import { extractFirstSlideImage } from '../extractAtom';
import type { Atom } from '../../types/Capi';

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

describe('extractFirstSlideImage', () => {
	it('returns the master image file when present', () => {
		const atom = atomWithFirstSlideImage('asset.jpg', 'master.jpg');
		expect(extractFirstSlideImage(atom)).toEqual('master.jpg');
	});

	it('falls back to the first asset file when there is no master', () => {
		const atom = atomWithFirstSlideImage('asset.jpg');
		expect(extractFirstSlideImage(atom)).toEqual('asset.jpg');
	});

	it('returns undefined when the first slide has no image', () => {
		const atom: Atom = {
			id: 'atom-id',
			atomType: 'multimediaslideshow',
			data: {
				multimediaSlideshow: {
					slides: [{ content: { mediaAtom: { mediaAtomId: 'media-1' } } }],
				},
			},
		};
		expect(extractFirstSlideImage(atom)).toBeUndefined();
	});

	it('returns undefined when there are no slides', () => {
		const atom: Atom = {
			id: 'atom-id',
			atomType: 'multimediaslideshow',
			data: { multimediaSlideshow: { slides: [] } },
		};
		expect(extractFirstSlideImage(atom)).toBeUndefined();
	});

	it('returns undefined for a non-slideshow atom', () => {
		const atom: Atom = {
			id: 'atom-id',
			atomType: 'media',
			data: {},
		};
		expect(extractFirstSlideImage(atom)).toBeUndefined();
	});
});
