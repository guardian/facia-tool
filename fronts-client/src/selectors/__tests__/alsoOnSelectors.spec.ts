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
	it('return an object with all the collections on the current front', () => {
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

	it('if a collection is NOT on another front, return an empty list of fronts for that collection', () => {
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

	it('if a collection IS on another front, return a list of shared fronts and priorities for that collection', () => {
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

	it('if a collection is on a commercial front and is shared with an editorial front, set meritsWarning to false', () => {
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

	it('if a collection is on a editorial front and is shared with an commercial front, set meritsWarning to true', () => {
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
