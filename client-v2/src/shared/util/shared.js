// @flow

import v4 from 'uuid/v4';
import { omit } from 'lodash';
import set from 'lodash/fp/set';

import type {
  CollectionWithNestedArticles,
  Collection,
  ArticleFragment,
  NestedArticleFragment
} from 'shared/types/Collection';
import { selectors as collectionSelectors } from 'shared/bundles/collectionsBundle';
import {
  articleFragmentSelector,
  selectSharedState
} from 'shared/selectors/shared';
import type { State } from 'types/State';

const getLastPartOfArticleFragmentId = (id: string) => id.split('/').pop();

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
  const stages = ['live', 'draft', 'previously'];

  const idMap = stages.reduce(
    (acc, currentStage) => ({
      ...acc,
      [currentStage]:
        collection[currentStage] && collection[currentStage].map(() => v4())
    }),
    {}
  );

  const articleFragments = stages.reduce(
    (allArticleFragments, currentStage) => {
      const articleFragmentsInStage =
        collection[currentStage] &&
        collection[currentStage].map((articleFragment, index) =>
          Object.assign({}, articleFragment, {
            uuid: idMap[currentStage] && idMap[currentStage][index],
            id: getLastPartOfArticleFragmentId(articleFragment.id)
          })
        );
      const fragmentsAsObjects: { [string]: ArticleFragment } = (
        articleFragmentsInStage || []
      ).reduce((acc, articleFragment) => {
        const supportingArticleFragments =
          articleFragment.meta && articleFragment.meta.supporting
            ? articleFragment.meta.supporting.map(
                supportingArticleFragment => ({
                  ...supportingArticleFragment,
                  uuid: v4(),
                  id: getLastPartOfArticleFragmentId(
                    supportingArticleFragment.id
                  )
                })
              )
            : [];
        const normalisedArticleFragment = !supportingArticleFragments.length
          ? articleFragment
          : {
              ...articleFragment,
              meta: {
                ...articleFragment.meta,
                supporting: supportingArticleFragments.map(
                  fragment => fragment.uuid
                )
              }
            };
        return {
          ...acc,
          ...supportingArticleFragments.reduce(
            (fragmentMap, fragment) => ({
              ...fragmentMap,
              [fragment.uuid]: fragment
            }),
            {}
          ),
          [articleFragment.uuid]: normalisedArticleFragment
        };
      }, {});
      return {
        ...allArticleFragments,
        ...fragmentsAsObjects
      };
    },
    {}
  );

  const collectionWithIds: Collection = Object.assign(
    {},
    omit(collection, ...stages),
    {
      articleFragments: idMap
    }
  );

  return {
    collection: collectionWithIds,
    articleFragments
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
