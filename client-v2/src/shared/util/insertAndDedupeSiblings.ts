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

  // the filter alone should be enough here but just in case any of the
  // insertions were duplicates then run `uniqBy` over and dedupe again
  return uniqBy(
    newSiblingArticleFragments.filter(
      (siblingArticleFragment, i) =>
        !insertionIDs.includes(siblingArticleFragment.id) ||
        // if we're not in the insertion group then keep it if it has the same
        // UUID (the assumption being we will clear it up with another action
        // elsewhere), otherwise if this is the one we inserted then keep it
        ((!isInsertionGroup &&
          insertionUUIDs.includes(siblingArticleFragment.uuid)) ||
          i === index)
    ),
    ({ id: dedupeKey }) => dedupeKey
  ).map(({ uuid }) => uuid);
};
