import React from 'react';
import renderer from 'react-test-renderer';
import { renderBoostToggles } from '../BoostToggles';

const mockCardId = 'test-card';

describe('renderBoostToggles', () => {
	const testCases = [
		{
			group: 0,
			type: 'flexible/general',
			expectedLabels: ['default', 'boost', 'megaboost'],
		},
		{
			group: 1,
			type: 'flexible/general',
			expectedLabels: ['default', 'boost'],
		},
		{ group: 2, type: 'flexible/general', expectedLabels: ['default'] },
		{
			group: 3,
			type: 'flexible/general',
			expectedLabels: ['default', 'boost', 'megaboost', 'gigaboost'],
		},
		{
			group: 0,
			type: 'flexible/special',
			expectedLabels: ['default', 'boost', 'megaboost'],
		},
		{
			group: 1,
			type: 'flexible/special',
			expectedLabels: ['default', 'boost', 'megaboost', 'gigaboost'],
		},
	];

	testCases.forEach(({ group, type, expectedLabels }) => {
		it(`renders the correct toggles for ${type} group ${group}`, () => {
			const tree = renderer
				.create(<>{renderBoostToggles(group, mockCardId, type)}</>)
				.toJSON();
			expect(tree).toMatchSnapshot();

			// Ensure expected labels exist
			const nodes = Array.isArray(tree) ? tree : [tree];
			const labels = nodes.map((node) => node?.props.label);
			expect(labels).toEqual(expectedLabels);
		});
	});

	it('renders an empty fragment if collectionType is invalid', () => {
		const tree = renderer
			.create(<>{renderBoostToggles(0, mockCardId, 'invalid/type')}</>)
			.toJSON();
		expect(tree).toMatchSnapshot();
		expect(tree).toBeNull();
	});

	it('renders an empty fragment if collectionType is missing', () => {
		const tree = renderer
			.create(<>{renderBoostToggles(0, mockCardId)}</>)
			.toJSON();
		expect(tree).toMatchSnapshot();
		expect(tree).toBeNull();
	});
});
