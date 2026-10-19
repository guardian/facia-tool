import type { Card } from 'types/Collection';

import { mayResetMultimediaSlideshowReplace } from '../../../actions/Cards';
import { baseTo, baseFrom } from './fixtures/groups.fixture';

describe('mayResetMultimediaSlideshowReplace', () => {
	const slideshowCard = (aspectRatio?: string): Card => ({
		frontPublicationDate: 1759943979968,
		id: 'internal-code/page/15513624',
		meta: {
			multimediaSlideshowReplace: true,
			multimediaSlideshowAtomId: 'atom/multimediaslideshow/slideshow-1',
			multimediaSlideshowAspectRatio: aspectRatio,
		},
		uuid: 'b62e749e-ce63-4f6d-9bfa-51888599ef1a',
	});

	const to_4_5_Collection = {
		...baseTo,
		collectionId: 'f4c5e687-0fc8-4456-b895-fd6e7237fa02',
	};
	const to_5_4_Collection = baseTo;

	const state: any = {
		collections: {
			data: {
				['da9953a2-6116-4e8d-9d62-f245fe65f399']: {
					id: 'da9953a2-6116-4e8d-9d62-f245fe65f399',
					type: 'flexible/general', // 5:4 container
				},
				['f4c5e687-0fc8-4456-b895-fd6e7237fa02']: {
					id: 'f4c5e687-0fc8-4456-b895-fd6e7237fa02',
					type: 'scrollable/feature', // 4:5 container
				},
			},
		},
	};

	it('should early exit if the card is being persisted to the clipboard', () => {
		const result = mayResetMultimediaSlideshowReplace({
			from: baseFrom,
			to: to_5_4_Collection,
			card: slideshowCard('4:5'),
			persistTo: 'clipboard',
			state,
		});
		expect(result).toBe(undefined);
	});
	it('should not reset the slideshow if moving a 4:5 slideshow to a 4:5 collection', () => {
		const result = mayResetMultimediaSlideshowReplace({
			from: baseFrom,
			to: to_4_5_Collection,
			card: slideshowCard('4:5'),
			persistTo: 'collection',
			state,
		});
		expect(result).toBe(undefined);
	});
	it('should reset the slideshow if moving a 4:5 slideshow to a 5:4 collection', () => {
		const result = mayResetMultimediaSlideshowReplace({
			from: baseFrom,
			to: to_5_4_Collection,
			card: slideshowCard('4:5'),
			persistTo: 'collection',
			state,
		});
		expect(result?.payload.meta.multimediaSlideshowReplace).toBe(false);
	});
	it('should reset the slideshow if moving a 16:9 slideshow to a 4:5 collection', () => {
		const result = mayResetMultimediaSlideshowReplace({
			from: null,
			to: to_4_5_Collection,
			card: slideshowCard('16:9'),
			persistTo: 'collection',
			state,
		});
		expect(result?.payload.meta.multimediaSlideshowReplace).toBe(false);
	});
	it('should not reset the slideshow if its aspect ratio is unknown', () => {
		const result = mayResetMultimediaSlideshowReplace({
			from: baseFrom,
			to: to_4_5_Collection,
			card: slideshowCard(undefined),
			persistTo: 'collection',
			state,
		});
		expect(result).toBe(undefined);
	});
});
