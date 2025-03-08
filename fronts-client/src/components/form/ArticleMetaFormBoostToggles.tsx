import InputRadio from 'components/inputs/InputRadio';
import React from 'react';
import { Field } from 'redux-form';

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
	0: [
		{ label: 'Default', ...Default },
		{ label: 'Boost', ...Boost },
		{ label: 'Mega Boost', ...MegaBoost },
	],
	1: [
		{ label: 'Default', ...Boost },
		{ label: 'Boost', ...MegaBoost },
	],
	2: [{ label: 'Default', ...MegaBoost }],
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
	0: [
		{ label: 'Default', ...Default },
		{ label: 'Boost', ...Boost },
		{ label: 'Mega Boost', ...MegaBoost },
	],
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
	if (!collectionType) return [<></>];
	if (
		collectionType !== 'flexible/general' &&
		collectionType !== 'flexible/special'
	)
		return [<></>];

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
