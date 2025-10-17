import {
	CollectionsWhichAreAlsoOnOtherFronts,
	CollectionsWhichAreAlsoOnOtherFrontsMap,
	CollectionWithNestedArticles,
} from 'types/Collection';
import { FrontConfig } from '../types/FaciaApi';
import uniq from 'lodash/uniq';

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
				iterateOverOtherFrontsCollections(
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

const iterateOverOtherFrontsCollections = (
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

/**
 * @param currentCollection
 * @param collections
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
	collections: CollectionWithNestedArticles[],
) => {
	const currentCollectionId = currentCollection.id;
	if (!currentCollection.draft) {
		return {};
	}
	const currentCollectionCardsDraft = currentCollection.draft.map(
		(draft) => draft.id,
	);

	return currentCollectionCardsDraft.reduce(
		(allCardAlsoOn, currentCollectionCardId) => {
			const cardAlsoOn = collections.reduce(
				(cardAlsoOnSoFar, collection) => {
					if (!collection.draft) {
						return {
							collections: cardAlsoOnSoFar.collections,
						};
					}
					const collectionCardsDraft = collection.draft.map(
						(draft) => draft.id,
					);
					const duplicatesOnCollection = collectionCardsDraft.reduce(
						(soFar, cardId) => {
							if (
								collection.id !== currentCollectionId &&
								cardId === currentCollectionCardId
							) {
								return {
									collections: soFar.collections.concat([
										{ id: collection.id },
									]),
								};
							}
							return soFar;
						},
						{ collections: [] as Array<{ id: string }> },
					);

					return {
						collections: cardAlsoOnSoFar.collections.concat(
							duplicatesOnCollection.collections,
						),
					};
				},
				{
					collections: [] as Array<{ id: string }>,
				},
			);

			return {
				...allCardAlsoOn,
				[currentCollectionCardId]: cardAlsoOn,
			};
		},
		{},
	);
};

export {
	selectCollectionsWhichAreAlsoOnOtherFronts,
	selectCardsWhichAreAlsoOnOtherCollectionsOnSameFront,
};
