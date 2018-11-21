import uniqBy from 'lodash/uniqBy';
import { ArticleFragment } from 'shared/types/Collection';

export const insertAndDedupeSiblings = (
  existingSiblingUUIDs: string[],
  insertionUUIDs: string[],
  index: number,
  articleFragmentMap: { [uuid: string]: ArticleFragment }
) => {
  const newSiblingUUIDs = [
    ...existingSiblingUUIDs.slice(0, index),
    ...insertionUUIDs,
    ...existingSiblingUUIDs.slice(index)
  ];
  const insertionIDs = insertionUUIDs.map(id => articleFragmentMap[id].id);
  const newSiblingArticleFragments = newSiblingUUIDs.map(
    id => articleFragmentMap[id]
  );

  // the filter alone should be enough here but just in case any of the
  // insertions were duplicates then run `uniqBy` over and dedupe again
  return uniqBy(
    newSiblingArticleFragments.filter(
      siblingArticleFragment =>
        insertionIDs.indexOf(siblingArticleFragment.id) === -1 ||
        insertionUUIDs.indexOf(siblingArticleFragment.uuid) > -1
    ),
    ({ id: dedupeKey }) => dedupeKey
  ).map(({ uuid }) => uuid);
};
