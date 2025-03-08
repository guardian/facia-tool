import React from 'react';
import renderer from 'react-test-renderer';
import { renderBoostToggles } from '../BoostToggles';

// Mock redux-form Field component so that we dont need to create a full redux-form setup (store, etc)
jest.mock('redux-form', () => ({
	Field: (props: Record<string, unknown>) => (
		<div {...props} data-testid="mock-field" />
	),
}));

const mockCardId = 'test-card';

const groupToggles = [
	{
		group: 0,
		collectionType: 'flexible/general',
		expectedLabels: ['default', 'boost', 'megaboost'],
	},
	{
		group: 1,
		collectionType: 'flexible/general',
		expectedLabels: ['default', 'boost'],
	},
	{ group: 2, collectionType: 'flexible/general', expectedLabels: ['default'] },
	{
		group: 3,
		collectionType: 'flexible/general',
		expectedLabels: ['default', 'boost', 'megaboost', 'gigaboost'],
	},
	{
		group: 0,
		collectionType: 'flexible/special',
		expectedLabels: ['default', 'boost', 'megaboost'],
	},
	{
		group: 1,
		collectionType: 'flexible/special',
		expectedLabels: ['default', 'boost', 'megaboost', 'gigaboost'],
	},
];

describe('renderBoostToggles', () => {
	groupToggles.forEach(({ group, collectionType, expectedLabels }) => {
		it(`returns the correct toggles for ${collectionType} group ${group}`, () => {
			// ✅ Get the raw output instead of rendering in a form
			const toggles = renderBoostToggles(group, mockCardId, collectionType);

			// ✅ Render only the toggles, skipping redux-form & form
			const tree = renderer.create(<>{toggles}</>).toJSON();
			expect(tree).toMatchSnapshot();

			// Ensure expected labels exist
			const nodes = Array.isArray(tree) ? tree : [tree];
			const labels = nodes.map((node) => node?.props.label);
			expect(labels).toEqual(expectedLabels);
		});
	});

	it('returns an empty fragment if collectionType is invalid', () => {
		const toggles = renderBoostToggles(0, mockCardId, 'invalid/type');
		const tree = renderer.create(<>{toggles}</>).toJSON();

		expect(tree).toMatchSnapshot();
		expect(tree).toBeNull(); // Ensure it returns nothing
	});

	it('returns an empty fragment if collectionType is missing', () => {
		const toggles = renderBoostToggles(0, mockCardId);
		const tree = renderer.create(<>{toggles}</>).toJSON();

		expect(tree).toMatchSnapshot();
		expect(tree).toBeNull(); // Ensure it returns nothing
	});
});
