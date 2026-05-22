import type { Card } from 'types/Collection';

import { mayResetImageReplace } from '../../../actions/Cards';
import { baseTo, baseFrom } from './fixtures/groups.fixture';

describe('mayResetImageReplace', () => {
	const replacedImage_4_5_Card: Card = {
		id: 'internal-code/page/15334368',
		frontPublicationDate: 1741879217277,
		meta: {
			imageReplace: true,
			imageSrcHeight: '1000',
			imageSrcWidth: '800',
		},
		uuid: 'abcd-1234',
	};

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
		const result = mayResetImageReplace({
			from: baseFrom,
			to: { ...baseTo, type: 'not-a-group' },
			card: replacedImage_4_5_Card,
			persistTo: 'collection',
			state,
		});
		expect(result).toBe(undefined);
	});
	it('should early exit if the card is being persisted to the clipboard', () => {
		const result = mayResetImageReplace({
			from: baseFrom,
			to: baseTo,
			card: replacedImage_4_5_Card,
			persistTo: 'clipboard',
			state,
		});
		expect(result).toBe(undefined);
	});
	it('should early exit if the card is being moved within the same group', () => {
		const result = mayResetImageReplace({
			from: { ...baseFrom, id: 'group-1' },
			to: { ...baseTo, id: 'group-1' },
			card: replacedImage_4_5_Card,
			persistTo: 'collection',
			state,
		});
		expect(result).toBe(undefined);
	});
	it('should not reset the imageReplace flag if moving from clipboard to a 4:5 collection', () => {
		const result = mayResetImageReplace({
			from: null,
			to: { ...baseTo, collectionId: 'f4c5e687-0fc8-4456-b895-fd6e7237fa02' },
			card: replacedImage_4_5_Card,
			persistTo: 'collection',
			state,
		});
		expect(result).toBe(undefined);
	});
	it('should reset the imageReplace flag if moving from clipboard to a 5:4 collection', () => {
		const result = mayResetImageReplace({
			from: null,
			to: baseTo,
			card: replacedImage_4_5_Card,
			persistTo: 'collection',
			state,
		});
		expect(result?.payload.meta.imageReplace).toBe(false);
	});
	it('should not reset the imageReplace flag if moving 4:5 card to a 4:5 collection', () => {
		const result = mayResetImageReplace({
			from: baseFrom,
			to: { ...baseTo, collectionId: 'f4c5e687-0fc8-4456-b895-fd6e7237fa02' },
			card: replacedImage_4_5_Card,
			persistTo: 'collection',
			state,
		});
		expect(result).toBe(undefined);
	});
	it('should reset the imageReplace flag if moving 4:5 card to a 5:4 collection', () => {
		const result = mayResetImageReplace({
			from: baseFrom,
			to: baseTo,
			card: replacedImage_4_5_Card,
			persistTo: 'collection',
			state,
		});
		expect(result?.payload.meta.imageReplace).toBe(false);
	});
});
