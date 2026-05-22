import type { Card } from 'types/Collection';

import { mayResetVideoReplace } from '../../../actions/Cards';
import { baseTo, baseFrom } from './fixtures/groups.fixture';

describe('mayResetVideoReplace', () => {
	const replacedVideo_4_5_Card: Card = {
		frontPublicationDate: 1759943979968,
		id: 'internal-code/page/15513624',
		meta: {
			replacementVideoAtom: {
				atomType: 'media',
				data: {
					media: {
						activeVersion: 1,
						assets: [],
						posterImage: {
							assets: [],
							master: {
								dimensions: { height: 1280, width: 720 },
								file: 'https://uploads.guimcode.co.uk/2025/10/15/Vertical_test--8c9349d2-36b2-4dd2-9bc0-85e708e5c1c4-1.0.0000000.jpg',
								mimeType: 'image/jpeg',
								type: 'image',
								typeData: {},
							},
						},
					},
				},
				id: '8c9349d2-36b2-4dd2-9bc0-85e708e5c1c4',
			},
			videoReplace: true,
		},
		uuid: 'b62e749e-ce63-4f6d-9bfa-51888599ef1a',
	};

	const replacedVideo_5_4_Card: Card = {
		frontPublicationDate: 1759943979968,
		id: 'internal-code/page/15513624',
		meta: {
			replacementVideoAtom: {
				atomType: 'media',
				data: {
					media: {
						activeVersion: 1,
						assets: [],
						posterImage: {
							assets: [],
							master: {
								dimensions: { height: 720, width: 1280 },
								file: 'https://uploads.guimcode.co.uk/2025/10/15/Vertical_test--8c9349d2-36b2-4dd2-9bc0-85e708e5c1c4-1.0.0000000.jpg',
								mimeType: 'image/jpeg',
								type: 'image',
								typeData: {},
							},
						},
					},
				},
				id: '8c9349d2-36b2-4dd2-9bc0-85e708e5c1c4',
			},
			videoReplace: true,
		},
		uuid: 'b62e749e-ce63-4f6d-9bfa-51888599ef1a',
	};

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

	it('should early exit if to is not a group', () => {
		const result = mayResetVideoReplace({
			from: baseFrom,
			to: { ...baseTo, type: 'not-a-group' },
			card: replacedVideo_4_5_Card,
			persistTo: 'collection',
			state,
		});
		expect(result).toBe(undefined);
	});
	it('should early exit if the card is being persisted to the clipboard', () => {
		const result = mayResetVideoReplace({
			from: baseFrom,
			to: baseTo,
			card: replacedVideo_4_5_Card,
			persistTo: 'clipboard',
			state,
		});
		expect(result).toBe(undefined);
	});
	it('should early exit if the card is being moved within the same group', () => {
		const result = mayResetVideoReplace({
			from: { ...baseFrom, id: 'group-1' },
			to: { ...baseTo, id: 'group-1' },
			card: replacedVideo_4_5_Card,
			persistTo: 'collection',
			state,
		});
		expect(result).toBe(undefined);
	});
	it('should not reset the videoReplace flag if moving from clipboard to a 4:5 collection', () => {
		const result = mayResetVideoReplace({
			from: null,
			to: to_4_5_Collection,
			card: replacedVideo_4_5_Card,
			persistTo: 'collection',
			state,
		});
		expect(result).toBe(undefined);
	});
	it('should reset the videoReplace flag if moving from clipboard to a 5:4 collection', () => {
		const result = mayResetVideoReplace({
			from: null,
			to: to_5_4_Collection,
			card: replacedVideo_4_5_Card,
			persistTo: 'collection',
			state,
		});
		expect(result?.payload.meta.videoReplace).toBe(false);
	});
	it('should not reset the videoReplace flag if moving 4:5 card to a 4:5 collection', () => {
		const result = mayResetVideoReplace({
			from: baseFrom,
			to: to_4_5_Collection,
			card: replacedVideo_4_5_Card,
			persistTo: 'collection',
			state,
		});
		expect(result).toBe(undefined);
	});
	it('should reset the videoReplace flag if moving 4:5 card to a 5:4 collection', () => {
		const result = mayResetVideoReplace({
			from: baseFrom,
			to: to_5_4_Collection,
			card: replacedVideo_4_5_Card,
			persistTo: 'collection',
			state,
		});
		expect(result?.payload.meta.videoReplace).toBe(false);
	});
	it('should not reset the videoReplace flag if moving 5:4 card to a 5:4 collection', () => {
		const result = mayResetVideoReplace({
			from: baseFrom,
			to: to_5_4_Collection,
			card: replacedVideo_5_4_Card,
			persistTo: 'collection',
			state,
		});
		expect(result).toBe(undefined);
	});
	it('should reset the videoReplace flag if moving 5:4 card to a 4:5 collection', () => {
		const result = mayResetVideoReplace({
			from: baseFrom,
			to: to_4_5_Collection,
			card: replacedVideo_5_4_Card,
			persistTo: 'collection',
			state,
		});
		expect(result?.payload.meta.videoReplace).toBe(false);
	});
});
