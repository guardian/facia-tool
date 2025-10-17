import {
	CardsWhichAreAlsoOnOtherCollectionsOnSameFront,
	CardsWhichAreAlsoOnOtherCollectionsOnSameFrontMap,
	CollectionsWhichAreAlsoOnOtherFronts,
	CollectionsWhichAreAlsoOnOtherFrontsMap,
	CollectionWithNestedArticles,
} from 'types/Collection';
import { FrontConfig } from '../types/FaciaApi';
import uniq from 'lodash/uniq';

/**
 *
 * @param currentFront
 * @param otherFronts
 *
 * For a given front:
 *  (1) Find the collections on that front
 *  (2) For each collection, find _other_ fronts that collection might be on
 *
 * 	Through nested reduce functions, return a keyed object:
 * 	{
 * 	  collection1: {
 * 			fronts: [
 * 				{ id: front1; priority: editorial },
 * 				{ id: front3; priority: editorial },
 * 			]
 * 	  },
 * 	  collection2: {
 * 	    fronts: [
 * 	    	{ id: front1; priority: editorial }
 * 	    ]
 * 	  },
 * 	  // if the collection is not on another front, return an empty fronts array
 * 	  collection3: {
 * 	    fronts: []
 * 	  }
 * 	}
 *
 * 	We also return some other data used to display warnings when dealing with a
 * 	container that might be on a commercial front (priorities, meritsWarning).
 */
const selectCollectionsWhichAreAlsoOnOtherFronts = (
	currentFront: FrontConfig | void,
	otherFronts: FrontConfig[],
): CollectionsWhichAreAlsoOnOtherFrontsMap => {
	if (!currentFront) {
		return {};
	}
	const currentFrontCollections = currentFront.collections;
	return currentFrontCollections.reduce(
		iterateOverCurrentFrontCollections(currentFront, otherFronts),
		{},
	);
};

const collectionsWhichAreAlsoOnOtherFrontsInitialValue: CollectionsWhichAreAlsoOnOtherFronts =
	{
		priorities: [] as string[],
		meritsWarning: false,
		fronts: [] as Array<{ id: string; priority: string }>,
	};

const iterateOverCurrentFrontCollections = (
	currentFront: FrontConfig,
	otherFronts: FrontConfig[],
) => {
	return (
		accumulator: CollectionsWhichAreAlsoOnOtherFrontsMap,
		currentFrontCollectionId: string,
	): CollectionsWhichAreAlsoOnOtherFrontsMap => {
		const collectionsWhichAreAlsoOnOtherFronts: CollectionsWhichAreAlsoOnOtherFronts =
			otherFronts.reduce(
				iterateOverOtherFronts(currentFront, currentFrontCollectionId),
				collectionsWhichAreAlsoOnOtherFrontsInitialValue,
			);

		return {
			...accumulator,
			[currentFrontCollectionId]: collectionsWhichAreAlsoOnOtherFronts,
		};
	};
};

const iterateOverOtherFronts = (
	currentFront: FrontConfig,
	currentFrontCollectionId: string,
) => {
	return (
		accumulator: CollectionsWhichAreAlsoOnOtherFronts,
		otherFront: FrontConfig,
	): CollectionsWhichAreAlsoOnOtherFronts => {
		const collectionsWhichAreAlsoOnOtherFronts: CollectionsWhichAreAlsoOnOtherFronts =
			otherFront.collections.reduce(
				iterateOverOtherFrontCollections(
					currentFront,
					currentFrontCollectionId,
					otherFront,
				),
				collectionsWhichAreAlsoOnOtherFrontsInitialValue,
			);

		return {
			priorities: uniq(
				accumulator.priorities.concat(
					collectionsWhichAreAlsoOnOtherFronts.priorities,
				),
			),
			meritsWarning:
				accumulator.meritsWarning ||
				collectionsWhichAreAlsoOnOtherFronts.meritsWarning,
			fronts: accumulator.fronts.concat(
				collectionsWhichAreAlsoOnOtherFronts.fronts,
			),
		};
	};
};

const iterateOverOtherFrontCollections = (
	currentFront: FrontConfig,
	currentFrontCollectionId: string,
	otherFront: FrontConfig,
) => {
	return (
		accumulator: CollectionsWhichAreAlsoOnOtherFronts,
		otherFrontCollectionId: string,
	): CollectionsWhichAreAlsoOnOtherFronts => {
		if (
			currentFront.id !== otherFront.id &&
			currentFrontCollectionId === otherFrontCollectionId
		) {
			const meritsWarning =
				currentFront.priority !== 'commercial' &&
				otherFront.priority === 'commercial';

			return {
				priorities: accumulator.priorities.concat([otherFront.priority]),
				meritsWarning: accumulator.meritsWarning || meritsWarning,
				fronts: accumulator.fronts.concat([
					{ id: otherFront.id, priority: otherFront.priority },
				]),
			};
		}
		return accumulator;
	};
};

/**
 * @param currentCollection
 * @param otherCollectionsOnSameFront
 *
 *  For a given collection:
 *  	(1) Find the cards on that collection
 *  	(2) For each card, find _other_ containers that card might be on (on the same front)
 *
 *  Through nested reduce functions, return a keyed object:
 *  {
 *    card1: {
 *      collections: [
 *        { id: collection1; },
 *        { id: collection2; }
 *      ]
 *    },
 *    card2: {
 *      collections: [
 *        { id: collection1; }
 *      ]
 *    },
 *    // if the card is not on another collection, return an empty collections array
 * 	  card3: {
 * 	    collections: []
 * 	  }
 *  }
 */
const selectCardsWhichAreAlsoOnOtherCollectionsOnSameFront = (
	currentCollection: CollectionWithNestedArticles,
	otherCollectionsOnSameFront: CollectionWithNestedArticles[],
) => {
	const currentCollectionId = currentCollection.id;
	if (!currentCollection.draft) {
		return {};
	}

	// Use Draft cards as these are the ones that show up in the UI
	// TODO: check this is true!
	const currentCollectionCards = currentCollection.draft.map(
		(draft) => draft.id,
	);

	return currentCollectionCards.reduce(
		iterateOverCurrentCollectionCards(
			currentCollectionId,
			otherCollectionsOnSameFront,
		),
		{},
	);
};

const cardsWhichAreAlsoOnOtherCollectionsOnSameFrontInitialValue: CardsWhichAreAlsoOnOtherCollectionsOnSameFront =
	{
		collections: [] as Array<{ id: string }>,
	};

const iterateOverCurrentCollectionCards = (
	currentCollectionId: string,
	otherCollectionsOnSameFront: CollectionWithNestedArticles[],
) => {
	return (
		accumulator: CardsWhichAreAlsoOnOtherCollectionsOnSameFrontMap,
		currentCollectionCardId: string,
	): CardsWhichAreAlsoOnOtherCollectionsOnSameFrontMap => {
		const cardsWhichAreAlsoOnOtherCollectionsOnSameFront: CardsWhichAreAlsoOnOtherCollectionsOnSameFront =
			otherCollectionsOnSameFront.reduce(
				iterateOverOtherCollectionsOnSameFront(
					currentCollectionId,
					currentCollectionCardId,
				),
				cardsWhichAreAlsoOnOtherCollectionsOnSameFrontInitialValue,
			);

		return {
			...accumulator,
			[currentCollectionCardId]: cardsWhichAreAlsoOnOtherCollectionsOnSameFront,
		};
	};
};

const iterateOverOtherCollectionsOnSameFront = (
	currentCollectionId: string,
	currentCollectionCardId: string,
) => {
	return (
		accumulator: CardsWhichAreAlsoOnOtherCollectionsOnSameFront,
		otherCollectionOnSameFront: CollectionWithNestedArticles,
	): CardsWhichAreAlsoOnOtherCollectionsOnSameFront => {
		if (!otherCollectionOnSameFront.draft) {
			return accumulator;
		}
		// Use Draft cards as these are the ones that show up in the UI
		// TODO: check this is true!
		const otherCollectionOnSameFrontCards =
			otherCollectionOnSameFront.draft.map((draft) => draft.id);
		const cardsWhichAreAlsoOnOtherCollectionsOnSameFront: CardsWhichAreAlsoOnOtherCollectionsOnSameFront =
			otherCollectionOnSameFrontCards.reduce(
				iterateOverOtherCollectionOnSameFrontCards(
					otherCollectionOnSameFront,
					currentCollectionId,
					currentCollectionCardId,
				),
				cardsWhichAreAlsoOnOtherCollectionsOnSameFrontInitialValue,
			);

		return {
			collections: accumulator.collections.concat(
				cardsWhichAreAlsoOnOtherCollectionsOnSameFront.collections,
			),
		};
	};
};

const iterateOverOtherCollectionOnSameFrontCards = (
	otherCollectionOnSameFront: CollectionWithNestedArticles,
	currentCollectionId: string,
	currentCollectionCardId: string,
) => {
	return (
		accumulator: CardsWhichAreAlsoOnOtherCollectionsOnSameFront,
		otherCollectionOnSameFrontCardId: string,
	): CardsWhichAreAlsoOnOtherCollectionsOnSameFront => {
		if (
			currentCollectionId !== otherCollectionOnSameFront.id &&
			currentCollectionCardId === otherCollectionOnSameFrontCardId
		) {
			return {
				collections: accumulator.collections.concat([
					{ id: otherCollectionOnSameFront.id },
				]),
			};
		}
		return accumulator;
	};
};

export {
	selectCollectionsWhichAreAlsoOnOtherFronts,
	selectCardsWhichAreAlsoOnOtherCollectionsOnSameFront,
};
