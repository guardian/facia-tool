import {
	selectCollectionsWhichAreAlsoOnOtherFronts,
	selectCardsWhichAreAlsoOnOtherCollectionsOnSameFront,
} from '../alsoOnSelectors';
import {
	additionalEditorialFronts,
	collectionCulture,
	collectionFootball,
	collectionObituaries,
	collectionsOnFront,
	collectionSport,
	collectionWhatToWatch,
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
				collection3: expect.any(Object),
				collection5: expect.any(Object),
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
			collection2: { priorities: [], meritsWarning: false, fronts: [] },
		});
	});

	it('if a collection IS on another front, return a list of shared fronts and priorities for that collection', () => {
		expect(
			selectCollectionsWhichAreAlsoOnOtherFronts(
				trainingFronts.find((front) => front.id === 'trainingFront'),
				allFronts,
			),
		).toEqual({
			collection3: {
				priorities: ['editorial'],
				meritsWarning: false,
				fronts: [{ id: 'editorialSharedWithTraining', priority: 'editorial' }],
			},
		});
	});

	it('if a collection is on a commercial front and is shared with an editorial front, set merit warning to false', () => {
		expect(
			selectCollectionsWhichAreAlsoOnOtherFronts(
				commercialFronts.find((front) => front.id === 'commercialFront'),
				allFronts,
			),
		).toEqual({
			collection1: {
				priorities: ['editorial'],
				meritsWarning: false,
				fronts: [{ id: 'editorialFront', priority: 'editorial' }],
			},
		});
	});

	it('if a collection is on a editorial front and is shared with an commercial front, set merit warning to true', () => {
		expect(
			selectCollectionsWhichAreAlsoOnOtherFronts(
				editorialFrontsInConfig.find((front) => front.id === 'editorialFront'),
				allFronts,
			),
		).toEqual({
			collection1: {
				priorities: ['commercial'],
				meritsWarning: true,
				fronts: [{ id: 'commercialFront', priority: 'commercial' }],
			},
		});
	});
});

describe('Selecting cards which are also on other collections', () => {
	it('return an object with all the cards on the current collection', () => {
		expect(
			selectCardsWhichAreAlsoOnOtherCollectionsOnSameFront(
				collectionCulture,
				collectionsOnFront,
			),
		).toEqual(
			expect.objectContaining({
				'billie-eilish-review': expect.any(Object),
				'jmw-turner-exhibition': expect.any(Object),
				'strictly-come-dancing': expect.any(Object),
			}),
		);
	});

	it('if a card is NOT on another collection, return an empty list of collections for that cards', () => {
		expect(
			selectCardsWhichAreAlsoOnOtherCollectionsOnSameFront(
				collectionObituaries,
				collectionsOnFront,
			),
		).toEqual({
			'donkey-kong-obituary': {
				collections: [],
			},
		});
	});

	it('if a card IS on another collection, return a list of shared collections for that card', () => {
		expect(
			selectCardsWhichAreAlsoOnOtherCollectionsOnSameFront(
				collectionFootball,
				collectionsOnFront,
			),
		).toEqual({
			'top-100-footballers': {
				collections: [{ id: 'sport' }],
			},
		});

		expect(
			selectCardsWhichAreAlsoOnOtherCollectionsOnSameFront(
				collectionSport,
				collectionsOnFront,
			),
		).toEqual({
			'question-of-sport': {
				collections: [{ id: 'what-to-watch' }],
			},
			'top-100-footballers': {
				collections: [{ id: 'football' }],
			},
		});

		expect(
			selectCardsWhichAreAlsoOnOtherCollectionsOnSameFront(
				collectionWhatToWatch,
				collectionsOnFront,
			),
		).toEqual({
			'question-of-sport': {
				collections: [{ id: 'sport' }],
			},
			'strictly-come-dancing': {
				collections: [{ id: 'culture' }],
			},
		});
	});

	it("if some cards are shared, and some aren't, return corresponding lists for each card", () => {
		expect(
			selectCardsWhichAreAlsoOnOtherCollectionsOnSameFront(
				collectionCulture,
				collectionsOnFront,
			),
		).toEqual({
			'billie-eilish-review': {
				collections: [],
			},
			'jmw-turner-exhibition': {
				collections: [],
			},
			'strictly-come-dancing': {
				collections: [{ id: 'what-to-watch' }],
			},
		});
	});
});
