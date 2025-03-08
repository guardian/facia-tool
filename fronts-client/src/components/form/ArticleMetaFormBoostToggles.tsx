import InputRadio from 'components/inputs/InputRadio';
import React from 'react';
import { Field } from 'redux-form';

/**
 * This function generates a set of radio button toggles for selecting a card's "boost level"
 * in a flexible collection. Boost levels help establish a visual hierarchy within a collection.
 *
 * ## Boost Levels:
 * - **default**: No boost
 * - **boost**: Slight emphasis
 * - **megaBoost**: Stronger emphasis
 * - **gigaBoost**: Most prominent
 *
 * ## Presets:
 * To simplify the boosting process for editors, we provide preset groups for different collection types.
 *
 * ### Flexible General (4 Groups):
 * - **Group 0 (Standard)**: Default, Boost, MegaBoost
 * - **Group 1 (Big)**: Boost, MegaBoost
 * - **Group 2 (Very Big)**: MegaBoost
 * - **Group 3 (Splash)**: Default, Boost, MegaBoost, GigaBoost
 *
 * ### Flexible Special (2 Groups):
 * - **Group 0 (Standard)**: Default, Boost, MegaBoost
 * - **Group 1 (Splash)**: Default, Boost, MegaBoost, GigaBoost
 *
 * ## Function:
 * Given a `groupIndex`, `cardId`, and `collectionType`, this function returns the appropriate
 * boost level radio button options.
 */

type BoostLevel = 'default' | 'boost' | 'megaBoost' | 'gigaBoost';

const boostTogglesOptions: Record<BoostLevel, { id: string; value: string }> = {
	default: {
		id: 'boostlevel-0',
		value: 'default',
	},
	boost: {
		id: 'boostlevel-1',
		value: 'boost',
	},
	megaBoost: {
		id: 'boostlevel-2',
		value: 'megaboost',
	},
	gigaBoost: {
		id: 'boostlevel-3',
		value: 'gigaboost',
	},
} as const;

const {
	default: Default,
	boost: Boost,
	megaBoost: MegaBoost,
	gigaBoost: GigaBoost,
} = boostTogglesOptions;

const flexibleGeneralTogglesMap: Record<
	number,
	{ label: string; id: string; value: string }[]
> = {
	// Group 0 = standard
	0: [
		{ label: 'Default', ...Default },
		{ label: 'Boost', ...Boost },
		{ label: 'Mega Boost', ...MegaBoost },
	],
	// Group 1 = big
	1: [
		{ label: 'Default', ...Boost },
		{ label: 'Boost', ...MegaBoost },
	],
	// Group 2 = very big
	2: [{ label: 'Default', ...MegaBoost }],
	// Group 3 = splash
	3: [
		{ label: 'Default', ...Default },
		{ label: 'Boost', ...Boost },
		{ label: 'Mega Boost', ...MegaBoost },
		{ label: 'Giga Boost', ...GigaBoost },
	],
};

const flexibleSpecialTogglesMap: Record<
	number,
	{ label: string; id: string; value: string }[]
> = {
	// Group 0 = standard
	0: [
		{ label: 'Default', ...Default },
		{ label: 'Boost', ...Boost },
		{ label: 'Mega Boost', ...MegaBoost },
	],
	// Group 1 = splash
	1: [
		{ label: 'Default', ...Default },
		{ label: 'Boost', ...Boost },
		{ label: 'Mega Boost', ...MegaBoost },
		{ label: 'Giga Boost', ...GigaBoost },
	],
};

const getInputId = (cardId: string, label: string) => `${cardId}-${label}`;

export const renderBoostToggles = (
	groupIndex: number = 0,
	cardId: string,
	collectionType?: string,
) => {
	// Only render boost toggles for flexible collections
	if (
		!collectionType ||
		!['flexible/general', 'flexible/special'].includes(collectionType)
	) {
		return [<></>];
	}

	const toggles =
		collectionType === 'flexible/general'
			? flexibleGeneralTogglesMap[groupIndex]
			: flexibleSpecialTogglesMap[groupIndex];

	return toggles.map(({ label, id, value }) => (
		<Field
			key={id}
			name={'boostLevel'}
			component={InputRadio}
			label={label}
			id={getInputId(cardId, id)}
			value={value}
			type="radio"
		/>
	));
};
