import type { Card } from 'types/Collection';

import { mayResetBoostLevel } from '../../../actions/Cards';
import { baseTo, baseFrom } from './fixtures/groups.fixture';

describe('mayResetBoostLevel', () => {
	it('should early exit if to is not a group', () => {
		const card = {} as Card;
		const result = mayResetBoostLevel(
			baseFrom,
			{ ...baseTo, type: 'not-a-group' },
			card,
			'collection',
		);
		expect(result).toBe(undefined);
	});
	it('should early exit if the card is being persisted to the clipboard', () => {
		const card = {} as Card;
		const result = mayResetBoostLevel(
			baseFrom,
			{ ...baseTo, type: 'not-a-group' },
			card,
			'clipboard',
		);
		expect(result).toBe(undefined);
	});

	it('should not reset the boost level if the card is moving inside the same group', () => {
		const card = {} as Card;
		const result = mayResetBoostLevel(
			{ ...baseFrom, id: 'group-1' },
			{ ...baseTo, id: 'group-1' },
			card,
			'collection',
		);
		expect(result).toBe(undefined);
	});
	it('should reset the boost level to `default` if the card is moving to a standard group', () => {
		const card = {} as Card;
		const result = mayResetBoostLevel(
			baseFrom,
			{ ...baseTo, groupName: 'standard' },
			card,
			'collection',
		);
		expect(result?.payload.meta.boostLevel).toBe('default');
	});
	it('should reset the boost level to `default` if the card is moving to a splash group', () => {
		const card = {} as Card;
		const result = mayResetBoostLevel(
			baseFrom,
			{ ...baseTo, groupName: 'splash' },
			card,
			'collection',
		);
		expect(result?.payload.meta.boostLevel).toBe('default');
	});
	it('should reset the boost level to `boost` if the card is moving to a big group', () => {
		const card = {} as Card;
		const result = mayResetBoostLevel(
			baseFrom,
			{ ...baseTo, groupName: 'big' },
			card,
			'collection',
		);
		expect(result?.payload.meta.boostLevel).toBe('boost');
	});
	it('should reset the boost level to `megaboost` if the card is moving to a very big group', () => {
		const card = {} as Card;
		const result = mayResetBoostLevel(
			baseFrom,
			{ ...baseTo, groupName: 'very big' },
			card,
			'collection',
		);
		expect(result?.payload.meta.boostLevel).toBe('megaboost');
	});
});
