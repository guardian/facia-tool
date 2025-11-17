import {
	CardMap,
	OtherCollectionsOnSameFrontThisCardIsOn,
	CardsWhichAreAlsoOnOtherCollectionsOnSameFrontMap,
	Collection,
	CollectionMap,
	CollectionsWhichAreAlsoOnOtherFronts,
	CollectionsWhichAreAlsoOnOtherFrontsMap,
	GroupMap,
	Card,
} from 'types/Collection';
import { FrontConfig } from '../types/FaciaApi';
import uniq from 'lodash/uniq';
import { emptyObject } from '../util/selectorUtils';
import { uniqBy } from 'lodash';

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
 * @param selectedFront
 * @param selectedCollection
 * @param collectionMap
 * @param groupMap
 * @param cardMap
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
	selectedFront: FrontConfig | undefined,
	selectedCollection: Collection | undefined,
	collectionMap: CollectionMap,
	groupMap: GroupMap,
	cardMap: CardMap,
): CardsWhichAreAlsoOnOtherCollectionsOnSameFrontMap => {
	if (
		!selectedFront ||
		!selectedCollection ||
		!selectedCollection.draft ||
		!selectedCollection.live ||
		!collectionMap ||
		!groupMap ||
		!cardMap
	) {
		return emptyObject;
	}

	// We want to look at cards on both draft and live versions of the collection
	// We will want to dedupe these cards, but it's not possible here as UUIDs are unique between draft and live
	const selectedCollectionGroupUuids = [
		...selectedCollection.draft,
		...selectedCollection.live,
	];
	const selectedCollectionCards = selectedCollectionGroupUuids.flatMap(
		(groupUuid) => {
			const selectedCollectionGroup = groupMap[groupUuid];
			return selectedCollectionGroup.cards.map((cardUuid) => cardMap[cardUuid]);
		},
	);

	// Here we can dedupe the cards which are on both draft and live
	const selectedCollectionCardsDedupedByStage = uniqBy(
		selectedCollectionCards,
		'id',
	);

	const otherCollectionsOnSameFrontUuids = selectedFront.collections.filter(
		(collectionUuid) => collectionUuid !== selectedCollection.id,
	);
	const otherCollectionsOnSameFront = otherCollectionsOnSameFrontUuids.map(
		(collectionUuid) => collectionMap[collectionUuid],
	);

	return selectedCollectionCardsDedupedByStage.reduce(
		iterateOverSelectedCollectionCards(
			otherCollectionsOnSameFront,
			groupMap,
			cardMap,
		),
		emptyObject,
	);
};

const cardsWhichAreAlsoOnOtherCollectionsOnSameFrontInitialValue: OtherCollectionsOnSameFrontThisCardIsOn =
	{
		collections: [] as Array<{ collectionUuid: string }>,
	};

const iterateOverSelectedCollectionCards = (
	otherCollectionsOnSameFront: Collection[],
	groupMap: GroupMap,
	cardMap: CardMap,
) => {
	return (
		accumulator: CardsWhichAreAlsoOnOtherCollectionsOnSameFrontMap,
		selectedCollectionCard: Card,
	): CardsWhichAreAlsoOnOtherCollectionsOnSameFrontMap => {
		const cardsWhichAreAlsoOnOtherCollectionsOnSameFront: OtherCollectionsOnSameFrontThisCardIsOn =
			otherCollectionsOnSameFront.reduce(
				iterateOverOtherCollectionsOnSameFront(
					// we need to compare on the card IDs...
					selectedCollectionCard.id,
					groupMap,
					cardMap,
				),
				cardsWhichAreAlsoOnOtherCollectionsOnSameFrontInitialValue,
			);
		return {
			...accumulator,
			// ...but we prefer to store with the UUIDs as this is the Redux way
			[selectedCollectionCard.uuid]:
				cardsWhichAreAlsoOnOtherCollectionsOnSameFront,
		};
	};
};

const iterateOverOtherCollectionsOnSameFront = (
	selectedCollectionCardId: string,
	groupMap: GroupMap,
	cardMap: CardMap,
) => {
	return (
		accumulator: OtherCollectionsOnSameFrontThisCardIsOn,
		otherCollectionOnSameFront: Collection,
	): OtherCollectionsOnSameFrontThisCardIsOn => {
		if (
			!otherCollectionOnSameFront ||
			!otherCollectionOnSameFront.draft ||
			!otherCollectionOnSameFront.live
		) {
			return accumulator;
		}
		// We want to look at cards on both draft and live versions of the collection
		// We will want to dedupe these cards, but it's not possible here as UUIDs are unique between draft and live
		const otherCollectionOnSameFrontGroupUuids = [
			...otherCollectionOnSameFront.draft,
			...otherCollectionOnSameFront.live,
		];
		const otherCollectionOnSameFrontCards =
			otherCollectionOnSameFrontGroupUuids.flatMap((groupUuid) => {
				const selectedCollectionGroup = groupMap[groupUuid];
				return selectedCollectionGroup.cards.map(
					(cardUuid) => cardMap[cardUuid],
				);
			});
		// Here we can dedupe the cards which are on both draft and live
		const otherCollectionOnSameFrontCardsDedupedByStage = uniqBy(
			otherCollectionOnSameFrontCards,
			'id',
		);
		const otherCollectionOnSameFrontCardsDedupedByStageIds =
			otherCollectionOnSameFrontCardsDedupedByStage.map((card) => card.id);

		const cardsWhichAreAlsoOnOtherCollectionsOnSameFront: OtherCollectionsOnSameFrontThisCardIsOn =
			otherCollectionOnSameFrontCardsDedupedByStageIds.reduce(
				iterateOverOtherCollectionOnSameFrontCards(
					otherCollectionOnSameFront,
					selectedCollectionCardId,
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
	otherCollectionOnSameFront: Collection,
	selectedCollectionCardId: string,
) => {
	return (
		accumulator: OtherCollectionsOnSameFrontThisCardIsOn,
		otherCollectionOnSameFrontCardId: string,
	): OtherCollectionsOnSameFrontThisCardIsOn => {
		if (selectedCollectionCardId === otherCollectionOnSameFrontCardId) {
			return {
				collections: accumulator.collections.concat([
					{ collectionUuid: otherCollectionOnSameFront.id },
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
