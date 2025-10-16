import { selectCollectionsWhichAreAlsoOnOtherFronts } from '../alsoOnSelectors';
import {
	additionalEditorialFronts,
	commercialFronts,
	editorialFrontsInConfig,
	trainingFronts,
} from './mock-data';

const allFronts = editorialFrontsInConfig
	.concat(additionalEditorialFronts)
	.concat(trainingFronts.concat(commercialFronts));

describe('Selecting collections which are also on other fronts', () => {
	it('fills in also details for all collections on a front', () => {
		expect(
			selectCollectionsWhichAreAlsoOnOtherFronts(
				additionalEditorialFronts.find(
					(front) => front.id === 'editorialSharedWithTraining',
				),
				allFronts,
			),
		).toEqual(
			expect.objectContaining({
				collectionUuid3: expect.any(Object),
				collectionUuid5: expect.any(Object),
			}),
		);
	});

	it('returns an empty list of fronts for collection which is not shared', () => {
		expect(
			selectCollectionsWhichAreAlsoOnOtherFronts(
				additionalEditorialFronts.find(
					(front) => front.id === 'editorialNotShared',
				),
				allFronts,
			),
		).toEqual({
			collectionUuid2: { priorities: [], meritsWarning: false, fronts: [] },
		});
	});

	it('returns correct list of shared fronts and priorities for shared collections', () => {
		expect(
			selectCollectionsWhichAreAlsoOnOtherFronts(
				trainingFronts.find((front) => front.id === 'trainingFront'),
				allFronts,
			),
		).toEqual({
			collectionUuid3: {
				priorities: ['editorial'],
				meritsWarning: false,
				fronts: [{ id: 'editorialSharedWithTraining', priority: 'editorial' }],
			},
		});
	});

	it('sets merit warning to false if shared collection appears on a commercial front', () => {
		expect(
			selectCollectionsWhichAreAlsoOnOtherFronts(
				commercialFronts.find((front) => front.id === 'commercialFront'),
				allFronts,
			),
		).toEqual({
			collectionUuid1: {
				priorities: ['editorial'],
				meritsWarning: false,
				fronts: [{ id: 'editorialFront', priority: 'editorial' }],
			},
		});
	});

	it('sets merits warning to true if a commercial collection is shared on another priority', () => {
		expect(
			selectCollectionsWhichAreAlsoOnOtherFronts(
				editorialFrontsInConfig.find((front) => front.id === 'editorialFront'),
				allFronts,
			),
		).toEqual({
			collectionUuid1: {
				priorities: ['commercial'],
				meritsWarning: true,
				fronts: [{ id: 'commercialFront', priority: 'commercial' }],
			},
		});
	});
});
