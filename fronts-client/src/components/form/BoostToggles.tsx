import InputRadio from 'components/inputs/InputRadio';
import React from 'react';
import { Field } from 'redux-form';
import type { BoostLevels } from 'types/Collection';

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
 */

type Toggle = { id: string; value: BoostLevels; label: string };

// Define all possible boost levels for toggles
const TOGGLES: Record<BoostLevels, Toggle> = {
	default: {
		id: 'boostlevel-0',
		value: 'default',
		label: 'Default',
	},
	boost: {
		id: 'boostlevel-1',
		value: 'boost',
		label: 'Boost',
	},
	megaboost: {
		id: 'boostlevel-2',
		value: 'megaboost',
		label: 'Mega Boost',
	},
	gigaboost: {
		id: 'boostlevel-3',
		value: 'gigaboost',
		label: 'Giga Boost',
	},
};

/**
 * ## Presets:
 * To simplify the boosting process for editors, we provide preset groups for different collection types.
 * We override the labels in some groups so they make more sense in the context of the collection.
 *
 * ### Flexible General (4 Groups):
 * - **Group 0 (Standard)**: Default, Boost, MegaBoost
 * - **Group 1 (Big)**: Boost, MegaBoost
 * - **Group 2 (Very Big)**: MegaBoost
 * - **Group 3 (Splash)**: Default, Boost, MegaBoost, GigaBoost
 *
 * ### Flexible Special (2 Groups):
 * - **Group 0 (Standard)**: Default, Boost, MegaBoost, GigaBoost
 * - **Group 1 (Splash)**: Default, Boost, MegaBoost, GigaBoost
 *
 * */
export const CollectionToggles: Record<string, Record<number, Toggle[]>> = {
	'flexible/general': {
		0: [TOGGLES.default, TOGGLES.boost, TOGGLES.megaboost],
		1: [
			{ ...TOGGLES.boost, label: 'Default' },
			{ ...TOGGLES.megaboost, label: 'Boost' },
		],
		2: [{ ...TOGGLES.megaboost, label: 'Default' }],
		3: [TOGGLES.default, TOGGLES.boost, TOGGLES.megaboost, TOGGLES.gigaboost],
	},
	'flexible/special': {
		0: [TOGGLES.default, TOGGLES.boost, TOGGLES.megaboost, TOGGLES.gigaboost],
		1: [TOGGLES.default, TOGGLES.boost, TOGGLES.megaboost, TOGGLES.gigaboost],
	},
};

const getInputId = (cardId: string, label: string) => `${cardId}-${label}`;

/**
 * ## Function:
 * Given a `groupIndex`, `cardId`, and `collectionType`, this function returns the appropriate
 * boost level radio button options.
 */
export const renderBoostToggles = (
	groupIndex: number = 0,
	cardId: string,
	onChange: (value: string) => void,
	collectionType?: string,
) => {
	// Only render boost toggles for flexible collections
	if (
		!collectionType ||
		!['flexible/general', 'flexible/special'].includes(collectionType)
	) {
		return [];
	}

	const toggles = CollectionToggles[collectionType][groupIndex];

	return toggles.map(({ label, id, value }) => (
		<Field
			key={id}
			name={'boostLevel'}
			component={InputRadio}
			label={label}
			id={getInputId(cardId, id)}
			value={value}
			type="radio"
			onChange={() => onChange('boostLevel')}
		/>
	));
};
