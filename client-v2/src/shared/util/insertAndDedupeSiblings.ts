import uniqBy from 'lodash/uniqBy';
import { ArticleFragment } from 'shared/types/Collection';

export const insertAndDedupeSiblings = (
  existingSiblingUUIDs: string[],
  insertionUUIDs: string[],
  assertedIndex: number,
  articleFragmentMap: { [uuid: string]: ArticleFragment },
  isInsertionGroup = true
) => {
  const index = Math.min(assertedIndex, existingSiblingUUIDs.length);
  const newSiblingUUIDs = isInsertionGroup
    ? [
        ...existingSiblingUUIDs.slice(0, index),
        ...insertionUUIDs,
        ...existingSiblingUUIDs.slice(index)
      ]
    : existingSiblingUUIDs;
  const insertionIDs = insertionUUIDs.map(id => articleFragmentMap[id].id);
  const newSiblingArticleFragments = newSiblingUUIDs.map(
    id => articleFragmentMap[id]
  );

  const isAnInsertedItem = (i: number) =>
    i >= index && i < index + insertionUUIDs.length;

  // the filter alone should be enough here but just in case any of the
  // insertions were duplicates then run `uniqBy` over and dedupe again
  return uniqBy(
    newSiblingArticleFragments.filter(
      (siblingArticleFragment, i) =>
        // keep anything that doesn't match on id or is the item we just
        // inserted
        !insertionIDs.includes(siblingArticleFragment.id) ||
        (isInsertionGroup && isAnInsertedItem(i))
    ),
    ({ id: dedupeKey }) => dedupeKey
  ).map(({ uuid }) => uuid);
};
