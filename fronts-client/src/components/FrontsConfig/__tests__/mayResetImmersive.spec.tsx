import type { Card } from 'types/Collection';

import { mayResetImmersive } from '../../../actions/Cards';
import { baseTo, baseFrom } from './fixtures/groups.fixture';

describe('mayResetImmersive', () => {
	const immersiveCard: Card = {
		id: 'internal-code/page/15334368',
		frontPublicationDate: 1741879217277,
		meta: {
			isImmersive: true,
		},
		uuid: 'abcd-1234',
	};

	const nonImmersiveCard: Card = {
		id: 'internal-code/page/43681533',
		frontPublicationDate: 1741879219999,
		meta: {
			isImmersive: false,
		},
		uuid: 'wxyz-5678',
	};

	const state: any = {
		collections: {
			data: {
				['da9953a2-6116-4e8d-9d62-f245fe65f399']: {
					id: 'da9953a2-6116-4e8d-9d62-f245fe65f399',
					type: 'flexible/general', // supports immersive flag
				},
				['f4c5e687-0fc8-4456-b895-fd6e7237fa02']: {
					id: 'f4c5e687-0fc8-4456-b895-fd6e7237fa02',
					type: 'scrollable/feature', // doesn't support immersive flag
				},
			},
		},
	};

	it('should early exit if to is not a group', () => {
		const result = mayResetImmersive({
			from: baseFrom,
			to: { ...baseTo, type: 'not-a-group' },
			card: immersiveCard,
			persistTo: 'collection',
			state,
		});
		expect(result).toBe(undefined);
	});
	it('should early exit if the card is being persisted to the clipboard', () => {
		const result = mayResetImmersive({
			from: baseFrom,
			to: baseTo,
			card: immersiveCard,
			persistTo: 'clipboard',
			state,
		});
		expect(result).toBe(undefined);
	});
	it('should early exit if the card is being moved within the same group', () => {
		const result = mayResetImmersive({
			from: { ...baseFrom, id: 'group-1' },
			to: { ...baseTo, id: 'group-1' },
			card: immersiveCard,
			persistTo: 'collection',
			state,
		});
		expect(result).toBe(undefined);
	});
	it('should not reset the immersive flag if card is not immersive', () => {
		const result = mayResetImmersive({
			from: null,
			to: baseTo,
			card: nonImmersiveCard,
			persistTo: 'collection',
			state,
		});
		expect(result).toBe(undefined);
	});
	it('should reset the immersive flag if moving to a scrollable container', () => {
		const result = mayResetImmersive({
			from: null,
			to: { ...baseTo, collectionId: 'f4c5e687-0fc8-4456-b895-fd6e7237fa02' },
			card: immersiveCard,
			persistTo: 'collection',
			state,
		});
		expect(result?.payload.meta.isImmersive).toBe(false);
	});
	it('should not reset the immersive flag if moving to a flexible/general card', () => {
		const result = mayResetImmersive({
			from: baseFrom,
			to: { ...baseTo, collectionId: 'da9953a2-6116-4e8d-9d62-f245fe65f399' },
			card: immersiveCard,
			persistTo: 'collection',
			state,
		});
		expect(result).toBe(undefined);
	});
});
