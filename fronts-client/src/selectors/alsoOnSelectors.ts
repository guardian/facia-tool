import {
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
	const cardIdToOtherCollectionUuids = new Map<string, string[]>();
	for (const otherCollection of otherCollectionsOnSameFront) {
		if (!otherCollection?.draft) {
			continue;
		}
		for (const groupUuid of otherCollection.draft) {
			const group = groupMap[groupUuid];
			if (!group) continue;
			for (const cardUuid of group.cards) {
				const card = cardMap[cardUuid];
				if (!card) continue;
				const matchingCollectionUuids = cardIdToOtherCollectionUuids.get(
					card.id,
				);
				if (matchingCollectionUuids) {
					matchingCollectionUuids.push(otherCollection.id);
				} else {
					cardIdToOtherCollectionUuids.set(card.id, [otherCollection.id]);
				}
				// Also search through sublinks (supporting cards)
				for (const supportingCardUuid of card.meta.supporting ?? []) {
					const supportingCard = cardMap[supportingCardUuid];
					if (!supportingCard) {
						continue;
					}
					const matchingCollectionUuidsForSupporting =
						cardIdToOtherCollectionUuids.get(supportingCard.id);
					if (matchingCollectionUuidsForSupporting) {
						matchingCollectionUuidsForSupporting.push(otherCollection.id);
					} else {
						cardIdToOtherCollectionUuids.set(supportingCard.id, [
							otherCollection.id,
						]);
					}
				}
			}
		}
	}

	// Use Draft cards as these are the ones that show up in the UI
	const result: CardsWhichAreAlsoOnOtherCollectionsOnSameFrontMap = {};
	for (const groupUuid of selectedCollection.draft) {
		const group = groupMap[groupUuid];
		if (!group) continue;
		for (const cardUuid of group.cards) {
			const card = cardMap[cardUuid];
			if (!card) continue;
			const matchingCollectionUuids = cardIdToOtherCollectionUuids.get(card.id);
			if (matchingCollectionUuids) {
				result[card.uuid] = {
					collections: matchingCollectionUuids.map((collectionUuid) => ({
						collectionUuid,
					})),
				};
			} else {
				result[card.uuid] = {
					collections: [],
				};
			}
			// Also check sublinks (supporting cards)
			for (const supportingCardUuid of card.meta.supporting ?? []) {
				const supportingCard = cardMap[supportingCardUuid];
				if (!supportingCard) {
					continue;
				}
				const matchingCollectionUuidsForSupporting =
					cardIdToOtherCollectionUuids.get(supportingCard.id);
				if (matchingCollectionUuidsForSupporting) {
					result[supportingCard.uuid] = {
						collections: matchingCollectionUuidsForSupporting.map(
							(collectionUuid) => ({
								collectionUuid,
							}),
						),
					};
				} else {
					result[supportingCard.uuid] = {
						collections: [],
					};
				}
			}
		}
	}

	return result;
};

export {
	selectCollectionsWhichAreAlsoOnOtherFronts,
	selectCardsWhichAreAlsoOnOtherCollectionsOnSameFront,
};
