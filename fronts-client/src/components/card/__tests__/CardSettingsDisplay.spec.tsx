import { getBoostLevelLabel } from '../CardSettingsDisplay';

describe('getBoostLevelLabel', () => {
	it('returns the correct label for a boosted card in the standard group (0) of a flexible/general container)', () => {
		expect(getBoostLevelLabel('boost', 0, 'flexible/general')).toBe('Boost');
	});

	it('returns undefined if the card has a default boost level', () => {
		expect(
			getBoostLevelLabel('default', 0, 'flexible/general'),
		).toBeUndefined();
	});

	it('returns a remapped label if a card in a big group is boosted', () => {
		expect(getBoostLevelLabel('megaboost', 1, 'flexible/general')).toBe(
			'Boost',
		);
		expect(getBoostLevelLabel('boost', 1, 'flexible/general')).toBeUndefined();
	});

	it('returns correct label for flexible/special group', () => {
		expect(getBoostLevelLabel('gigaboost', 0, 'flexible/special')).toBe(
			'Giga Boost',
		);
	});

	it('returns undefined for invalid boost level', () => {
		expect(
			getBoostLevelLabel(undefined, 0, 'flexible/general'),
		).toBeUndefined();
	});

	it('returns undefined for undefined group index', () => {
		expect(
			getBoostLevelLabel('boost', undefined, 'flexible/general'),
		).toBeUndefined();
	});

	it('returns undefined for invalid collection type', () => {
		expect(
			getBoostLevelLabel('boost', 0, 'unknown/collection'),
		).toBeUndefined();
	});

	it('returns undefined if boost level not found in toggles', () => {
		expect(
			getBoostLevelLabel('gigaboost', 2, 'flexible/general'),
		).toBeUndefined();
	});
});
