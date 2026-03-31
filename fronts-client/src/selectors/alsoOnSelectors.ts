import {
	CardIdToOtherCollectionUuidsMap,
	CardMap,
	CardsWhichAreAlsoOnOtherCollectionsOnSameFrontMap,
	Collection,
	CollectionsWhichAreAlsoOnOtherFronts,
	CollectionsWhichAreAlsoOnOtherFrontsMap,
	GroupMap,
} from 'types/Collection';
import { FrontConfig } from '../types/FaciaApi';
import uniq from 'lodash/uniq';
import { emptyObject } from '../util/selectorUtils';

/**
 *
 * @param selectedFront
 * @param allFronts
 *
 * For a given front:
 *  (1) Find the collections on that front
 *  (2) For each collection, find _other_ fronts that collection might be on
 *
 * 	Through nested reduce functions, return a keyed object:
 * 	{
 * 	  collectionUuid1: {
 * 			fronts: [
 * 				{ id: frontId1; priority: editorial },
 * 				{ id: frontId3; priority: editorial },
 * 			]
 * 	  },
 * 	  collectionUuid2: {
 * 	    fronts: [
 * 	    	{ id: frontId1; priority: editorial }
 * 	    ]
 * 	  },
 * 	  // if the collection is not on another front, return an empty fronts array
 * 	  collectionUuid3: {
 * 	    fronts: []
 * 	  }
 * 	}
 *
 * 	We also return some other data used to display warnings when dealing with a
 * 	container that might be on a commercial front (priorities, meritsWarning).
 */
const selectCollectionsWhichAreAlsoOnOtherFronts = (
	selectedFront: FrontConfig | undefined,
	allFronts: FrontConfig[],
): CollectionsWhichAreAlsoOnOtherFrontsMap => {
	if (!selectedFront) {
		return emptyObject;
	}
	const otherFronts = allFronts.filter(
		(front) => front.id !== selectedFront.id,
	);
	const selectedFrontCollections = selectedFront.collections;
	return selectedFrontCollections.reduce(
		iterateOverSelectedFrontCollections(selectedFront, otherFronts),
		emptyObject,
	);
};

const collectionsWhichAreAlsoOnOtherFrontsInitialValue: CollectionsWhichAreAlsoOnOtherFronts =
	{
		priorities: [] as string[],
		meritsWarning: false,
		fronts: [] as Array<{ id: string; priority: string }>,
	};

const iterateOverSelectedFrontCollections = (
	selectedFront: FrontConfig,
	otherFronts: FrontConfig[],
) => {
	return (
		accumulator: CollectionsWhichAreAlsoOnOtherFrontsMap,
		selectedFrontCollectionId: string,
	): CollectionsWhichAreAlsoOnOtherFrontsMap => {
		const collectionsWhichAreAlsoOnOtherFronts: CollectionsWhichAreAlsoOnOtherFronts =
			otherFronts.reduce(
				iterateOverOtherFronts(selectedFront, selectedFrontCollectionId),
				collectionsWhichAreAlsoOnOtherFrontsInitialValue,
			);

		return {
			...accumulator,
			[selectedFrontCollectionId]: collectionsWhichAreAlsoOnOtherFronts,
		};
	};
};

const iterateOverOtherFronts = (
	selectedFront: FrontConfig,
	selectedFrontCollectionId: string,
) => {
	return (
		accumulator: CollectionsWhichAreAlsoOnOtherFronts,
		otherFront: FrontConfig,
	): CollectionsWhichAreAlsoOnOtherFronts => {
		const collectionsWhichAreAlsoOnOtherFronts: CollectionsWhichAreAlsoOnOtherFronts =
			otherFront.collections.reduce(
				iterateOverOtherFrontCollections(
					selectedFront,
					selectedFrontCollectionId,
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
	selectedFront: FrontConfig,
	selectedFrontCollectionId: string,
	otherFront: FrontConfig,
) => {
	return (
		accumulator: CollectionsWhichAreAlsoOnOtherFronts,
		otherFrontCollectionId: string,
	): CollectionsWhichAreAlsoOnOtherFronts => {
		if (selectedFrontCollectionId === otherFrontCollectionId) {
			const meritsWarning =
				selectedFront.priority !== 'commercial' &&
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

const walkCards = (
	cardMap: CardMap,
	cardUuids: string[],
	visit: (card: CardMap[string]) => void,
) => {
	for (const cardUuid of cardUuids) {
		const card = cardMap[cardUuid];
		if (!card) continue;
		visit(card);
		if (card.meta.supporting) {
			walkCards(cardMap, card.meta.supporting, visit);
		}
	}
};

const constructCardIdToOtherCollectionUuidsMap = (
	cardMap: CardMap,
	cardIdToOtherCollectionUuidsMap: CardIdToOtherCollectionUuidsMap,
	otherCollectionId: string,
	cardUuids: string[],
) => {
	walkCards(cardMap, cardUuids, (card) => {
		const matchingCollectionUuids = cardIdToOtherCollectionUuidsMap.get(
			card.id,
		);
		if (matchingCollectionUuids) {
			// map entry already exists, add to it
			matchingCollectionUuids.push(otherCollectionId);
		} else {
			// create new map entry
			cardIdToOtherCollectionUuidsMap.set(card.id, [otherCollectionId]);
		}
	});
};

const constructCardsWhichAreAlsoOnOtherCollectionsOnSameFrontMap = (
	cardMap: CardMap,
	cardIdToOtherCollectionUuidsMap: CardIdToOtherCollectionUuidsMap,
	cardsWhichAreAlsoOnOtherCollectionsOnSameFrontMap: CardsWhichAreAlsoOnOtherCollectionsOnSameFrontMap,
	cardUuids: string[],
) => {
	walkCards(cardMap, cardUuids, (card) => {
		const matchingCollectionUuids =
			cardIdToOtherCollectionUuidsMap.get(card.id) ?? [];
		cardsWhichAreAlsoOnOtherCollectionsOnSameFrontMap[card.uuid] = {
			collections: matchingCollectionUuids.map((collectionUuid) => ({
				collectionUuid,
			})),
		};
	});
};

const iterateOverCollection = (
	collection: Collection,
	groupMap: GroupMap,
	callback: (cardUuids: string[]) => void,
) => {
	if (!collection.draft) return;

	for (const groupUuid of collection.draft) {
		const group = groupMap[groupUuid];
		if (!group) continue;
		callback(group.cards);
	}
};

/**
 * @param selectedCollection
 * @param otherCollectionsOnSameFront
 * @param groupMap
 * @param cardMap
 *
 *  For a given collection:
 *  	(1) Find the cards on that collection
 *  	(2) For each card, find _other_ containers that card might be on (on the same front)
 *
 *  Return a keyed object:
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
	selectedCollection: Collection | undefined,
	otherCollectionsOnSameFront: Collection[],
	groupMap: GroupMap,
	cardMap: CardMap,
): CardsWhichAreAlsoOnOtherCollectionsOnSameFrontMap => {
	if (
		!selectedCollection ||
		!selectedCollection.draft ||
		!otherCollectionsOnSameFront ||
		!groupMap ||
		!cardMap
	) {
		return emptyObject;
	}

	// Pre-build a map of cardId -> collectionUuids from other collections,
	// so we can do O(1) lookups instead of nested iterations per card
	const cardIdToOtherCollectionUuidsMap: CardIdToOtherCollectionUuidsMap =
		new Map<string, string[]>();
	for (const otherCollection of otherCollectionsOnSameFront) {
		if (!otherCollection?.draft) {
			continue;
		}
		iterateOverCollection(otherCollection, groupMap, (cardUuids) => {
			constructCardIdToOtherCollectionUuidsMap(
				cardMap,
				cardIdToOtherCollectionUuidsMap,
				otherCollection.id,
				cardUuids,
			);
		});
	}

	// Use Draft cards as these are the ones that show up in the UI
	const cardsWhichAreAlsoOnOtherCollectionsOnSameFrontMap: CardsWhichAreAlsoOnOtherCollectionsOnSameFrontMap =
		{};
	iterateOverCollection(selectedCollection, groupMap, (cardUuids) => {
		constructCardsWhichAreAlsoOnOtherCollectionsOnSameFrontMap(
			cardMap,
			cardIdToOtherCollectionUuidsMap,
			cardsWhichAreAlsoOnOtherCollectionsOnSameFrontMap,
			cardUuids,
		);
	});

	return cardsWhichAreAlsoOnOtherCollectionsOnSameFrontMap;
};

export {
	selectCollectionsWhichAreAlsoOnOtherFronts,
	selectCardsWhichAreAlsoOnOtherCollectionsOnSameFront,
};
