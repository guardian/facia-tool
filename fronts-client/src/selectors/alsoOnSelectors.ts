import {
	CollectionsWhichAreAlsoOnOtherFronts,
	CollectionsWhichAreAlsoOnOtherFrontsMap,
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

export { selectCollectionsWhichAreAlsoOnOtherFronts };
