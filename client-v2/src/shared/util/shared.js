// @flow

import v4 from 'uuid/v4';
import { omit } from 'lodash';

import type {
  CollectionWithNestedArticles,
  Collection,
  ArticleFragment,
  NestedArticleFragment
} from 'shared/types/Collection';

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

export { normaliseCollectionWithNestedArticles, getArticleIdsFromCollection };
