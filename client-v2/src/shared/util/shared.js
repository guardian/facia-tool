// @flow

import v4 from 'uuid/v4';
import { omit } from 'lodash';
import set from 'lodash/fp/set';

import type {
  CollectionWithNestedArticles,
  NestedArticleFragment
} from 'shared/types/Collection';
import { selectors as collectionSelectors } from 'shared/bundles/collectionsBundle';
import {
  articleFragmentSelector,
  selectSharedState
} from 'shared/selectors/shared';
import type { State } from 'types/State';

import { normalize } from './schema';

const getArticleIdsFromNestedArticleFragment = (
  fragments: string[],
  nestedArticleFragment: NestedArticleFragment
) =>
  nestedArticleFragment.meta && nestedArticleFragment.meta.supporting
    ? [
        ...fragments,
        nestedArticleFragment.id,
        ...nestedArticleFragment.meta.supporting.map(
          supportingArticleFragment => supportingArticleFragment.id
        )
      ]
    : [...fragments, nestedArticleFragment.id];

const getArticleIdsFromCollection = (
  collection: CollectionWithNestedArticles
) =>
  collection.live
    ? [
        // We use a set to dedupe our article ids
        ...new Set([
          ...(collection.draft || []).reduce(
            getArticleIdsFromNestedArticleFragment,
            []
          ),
          ...collection.live.reduce(getArticleIdsFromNestedArticleFragment, [])
        ])
      ]
    : [];

const normaliseCollectionWithNestedArticles = (
  collection: CollectionWithNestedArticles
) => {
  const normalisedCollection = normalize(collection);
  return {
    collection: normalisedCollection.result,
    groups: normalisedCollection.entities.groups || [],
    articleFragments: normalisedCollection.entities.articleFragments || []
  };
};

function denormaliseArticleFragment(state: State, id: string) {
  let articleFragment = articleFragmentSelector(selectSharedState(state), id);
  if (!articleFragment) {
    throw new Error(
      `Could not denormalise article fragment - no article fragment found with id '${id}'`
    );
  }
  if (articleFragment.meta && articleFragment.meta.supporting) {
    articleFragment = set(
      ['meta', 'supporting'],
      articleFragment.meta.supporting.map(supportingFragmentId =>
        denormaliseArticleFragment(state, supportingFragmentId)
      ),
      articleFragment
    );
  }
  const { idWithPath } = articleFragment;
  return {
    ...omit(articleFragment, 'uuid', 'idWithPath'),
    id: idWithPath
  };
}

function denormaliseCollection(state: State, id: string) {
  const collection = collectionSelectors.selectById(
    selectSharedState(state),
    id
  );
  if (!collection) {
    throw new Error(
      `Could not denormalise collection - no collection found with id '${id}'`
    );
  }
  const mapArticleFragments = (fragmentId: string) =>
    denormaliseArticleFragment(state, fragmentId);
  return {
    ...omit(collection, 'articleFragments', 'id'),
    live: collection.articleFragments.live
      ? collection.articleFragments.live.map(mapArticleFragments, {})
      : [],
    draft: collection.articleFragments.draft
      ? collection.articleFragments.draft.map(mapArticleFragments, {})
      : []
  };
}

export {
  normaliseCollectionWithNestedArticles,
  getArticleIdsFromCollection,
  denormaliseArticleFragment,
  denormaliseCollection
};
