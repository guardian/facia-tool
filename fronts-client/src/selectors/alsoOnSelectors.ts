import { AlsoOnDetail } from 'types/Collection';
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

export { selectCollectionsWhichAreAlsoOnOtherFronts };
