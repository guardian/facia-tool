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
};

const {
	default: Default,
	boost: Boost,
	megaBoost: MegaBoost,
	gigaBoost: GigaBoost,
} = boostTogglesOptions;

const groupTogglesMap: Record<
	Groups,
	{ label: string; id: string; value: string }[]
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
	groupIndex in Groups;

export const renderBoostToggles = (groupIndex: number = 0, cardId: string) => {
	const groupId: Groups = isValidGroup(groupIndex)
		? groupIndex
		: Groups.Standard;

	return groupTogglesMap[groupId].map(({ label, id, value }) => (
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
