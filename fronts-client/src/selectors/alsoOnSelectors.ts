import { AlsoOnDetail, CollectionWithNestedArticles } from 'types/Collection';
import { FrontConfig } from '../types/FaciaApi';
import uniq from 'lodash/uniq';

/**
 *
 * @param currentFront
 * @param fronts
 *
 * For a given front:
 *  (1) Find the collections on that front
 *  (2) For each collection, find _other_ fronts that collection is on
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
 * 	  }
 * 	}
 *
 * 	Along with some other hydrated data (priorities, meritsWarning).
 */
const selectCollectionsWhichAreAlsoOnOtherFronts = (
	currentFront: FrontConfig | void,
	fronts: FrontConfig[],
): { [id: string]: AlsoOnDetail } => {
	if (!currentFront) {
		return {};
	}
	const currentFrontId = currentFront.id;
	const currentFrontPriority = currentFront.priority;
	const currentFrontCollections = currentFront.collections;
	return currentFrontCollections.reduce(
		(allCollectionAlsoOn, currentFrontCollectionId) => {
			const collectionAlsoOn = fronts.reduce(
				(collectionAlsoOnSoFar, front) => {
					const duplicatesOnFront = front.collections.reduce(
						(soFar, collectionId) => {
							if (
								front.id !== currentFrontId &&
								collectionId === currentFrontCollectionId
							) {
								const meritsWarning =
									currentFrontPriority !== 'commercial' &&
									front.priority === 'commercial';

								return {
									priorities: soFar.priorities.concat([front.priority]),
									meritsWarning: soFar.meritsWarning || meritsWarning,
									fronts: soFar.fronts.concat([
										{ id: front.id, priority: front.priority },
									]),
								};
							}
							return soFar;
						},
						{
							priorities: [] as string[],
							meritsWarning: false,
							fronts: [] as Array<{ id: string; priority: string }>,
						},
					);

					return {
						priorities: uniq(
							collectionAlsoOnSoFar.priorities.concat(
								duplicatesOnFront.priorities,
							),
						),
						meritsWarning:
							collectionAlsoOnSoFar.meritsWarning ||
							duplicatesOnFront.meritsWarning,
						fronts: collectionAlsoOnSoFar.fronts.concat(
							duplicatesOnFront.fronts,
						),
					};
				},
				{
					priorities: [] as string[],
					fronts: [] as Array<{ id: string; priority: string }>,
					meritsWarning: false,
				},
			);

			return {
				...allCollectionAlsoOn,
				[currentFrontCollectionId]: collectionAlsoOn,
			};
		},
		{},
	);
};

/**
 * @param currentCollection
 * @param collections
 *
 *  For a given collection:
 *  	(1) Find the cards on that collection
 *  	(2) For each card, find _other_ containers that card is on (on the same front)
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
 *    }
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
