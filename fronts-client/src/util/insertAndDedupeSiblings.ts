import uniqBy from 'lodash/uniqBy';
import { Card } from 'types/Collection';

export const insertAndDedupeSiblings = (
	existingSiblingUUIDs: string[],
	insertionUUIDs: string[],
	assertedIndex: number,
	cardMap: { [uuid: string]: Card },
	isInsertionGroup = true,
) => {
	const index = Math.min(assertedIndex, existingSiblingUUIDs.length);
	const newSiblingUUIDs = isInsertionGroup
		? [
				...existingSiblingUUIDs.slice(0, index),
				...insertionUUIDs,
				...existingSiblingUUIDs.slice(index),
			]
		: existingSiblingUUIDs;
	const insertionIDs = insertionUUIDs.map((id) => cardMap[id].id);
	const newSiblingCards = newSiblingUUIDs.map((id) => cardMap[id]);

	const isAnInsertedItem = (i: number) =>
		i >= index && i < index + insertionUUIDs.length;

	// the filter alone should be enough here but just in case any of the
	// insertions were duplicates then run `uniqBy` over and dedupe again
	return uniqBy(
		newSiblingCards.filter(
			(siblingCard, i) =>
				// keep anything that doesn't match on id or is the item we just
				// inserted
				!insertionIDs.includes(siblingCard.id) ||
				(isInsertionGroup && isAnInsertedItem(i)),
		),
		({ id: dedupeKey }) => dedupeKey,
	).map(({ uuid }) => uuid);
};
