import InputRadio from 'components/inputs/InputRadio';
import React from 'react';
import { Field } from 'redux-form';

enum Groups {
	Standard,
	Big,
	VeryBig,
	Splash,
}

type BoostLevel = 'default' | 'boost' | 'megaBoost' | 'gigaBoost';

const boostTogglesOptions: Record<
	BoostLevel,
	{ id: string; name: string; value: string }
> = {
	default: {
		id: 'boostlevel-0',
		name: 'default',
		value: 'default',
	},
	boost: {
		id: 'boostlevel-1',
		name: 'boost',
		value: 'boost',
	},
	megaBoost: {
		id: 'boostlevel-2',
		name: 'megaBoost',
		value: 'megaBoost',
	},
	gigaBoost: {
		id: 'boostlevel-3',
		name: 'gigaBoost',
		value: 'gigaBoost',
	},
};

const {
	default: Default,
	boost: Boost,
	megaBoost: MegaBoost,
	gigaBoost: GigaBoost,
} = boostTogglesOptions;

const groupTogglesMap: Record<
	Groups,
	{ label: string; id: string; value: string; name: string }[]
> = {
	[Groups.Standard]: [
		{ label: 'Default', ...Default },
		{ label: 'Boost', ...Boost },
		{ label: 'Mega Boost', ...MegaBoost },
	],
	[Groups.Big]: [
		{ label: 'Default', ...Boost },
		{ label: 'Boost', ...MegaBoost },
	],
	[Groups.VeryBig]: [{ label: 'Default', ...MegaBoost }],
	[Groups.Splash]: [
		{ label: 'Default', ...Default },
		{ label: 'Boost', ...Boost },
		{ label: 'Mega Boost', ...MegaBoost },
		{ label: 'Giga Boost', ...GigaBoost },
	],
};

const getInputId = (cardId: string, label: string) => `${cardId}-${label}`;

const isValidGroup = (groupIndex: number): groupIndex is Groups =>
	Object.values(Groups).includes(groupIndex);

export const renderBoostToggles = (groupIndex: number = 0, cardId: string) => {
	const group: Groups = isValidGroup(groupIndex) ? groupIndex : Groups.Standard;
	const groupToggles = groupTogglesMap[group];

	return groupToggles.map(({ name, label, id, value }) => (
		<Field
			name={name}
			component={InputRadio}
			label={label}
			id={getInputId(cardId, id)}
			value={value}
			type="radio"
		/>
	));
};
