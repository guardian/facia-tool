// @flow

import type { CollectionWithNestedArticles } from 'shared/types/Collection';
import { selectors as collectionSelectors } from 'shared/bundles/collectionsBundle';
import { selectSharedState } from 'shared/selectors/shared';
import type { State } from 'types/State';

import { normalize, denormalize } from './schema';

const normaliseCollectionWithNestedArticles = (
  collection: CollectionWithNestedArticles
) => {
  const normalisedCollection = normalize(collection);
  return {
    collection: normalisedCollection.result,
    groups: normalisedCollection.entities.groups || {},
    articleFragments: normalisedCollection.entities.articleFragments || {}
  };
};

function denormaliseCollection(
  state: State,
  id: string
): CollectionWithNestedArticles {
  const collection = collectionSelectors.selectById(
    selectSharedState(state),
    id
  );
  if (!collection) {
    throw new Error(
      `Could not denormalise collection - no collection found with id '${id}'`
    );
  }

  return denormalize(collection, {
    articleFragments: state.shared.articleFragments,
    groups: state.shared.groups
  });
}

export { normaliseCollectionWithNestedArticles, denormaliseCollection };
