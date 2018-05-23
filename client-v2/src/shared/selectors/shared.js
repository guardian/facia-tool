// @flow

import { createSelector } from 'reselect';
import { omit } from 'lodash';

import type { ArticleFragment } from '../types/Collection';
import type { RootState as State } from '../types/State';

const externalArticlesSelector = (state: State) => state.externalArticles;

const articleFragmentsSelector = (state: State) => state.articleFragments;

const articleFragmentSelector = (state: State, id: string): ArticleFragment =>
  state.articleFragments[id];

const externalArticleFromArticleFragmentSelector = (
  state: State,
  id: string
) => {
  const articleFragment = articleFragmentSelector(state, id);
  const externalArticles = externalArticlesSelector(state);
  if (!articleFragment) {
    return null;
  }
  return externalArticles[articleFragment.id] || null;
};

const createArticleFromArticleFragmentSelector = () =>
  createSelector(
    articleFragmentSelector,
    externalArticleFromArticleFragmentSelector,
    (articleFragment, externalArticle) => {
      if (!articleFragment || !externalArticle) {
        return null;
      }
      const group = articleFragment.meta && articleFragment.meta.group;
      const supporting =
        articleFragment.meta && articleFragment.meta.supporting;
      return {
        ...externalArticle,
        ...{ group, supporting }
      };
    }
  );

const collectionsSelector = (state: State) => state.collections;

const collectionIdSelector = (_, { collectionId }: { collectionId: string }) =>
  collectionId;

const createCollectionSelector = () =>
  createSelector(
    collectionsSelector,
    collectionIdSelector,
    (collections, id) => collections[id]
  );

const groupNameSelector = (_, { groupName }: { groupName: string }) =>
  groupName;

const stageSelector = (_, { stage }: { stage: string }) => stage;

const createArticlesInCollectionGroupSelector = () => {
  const collectionSelector = createCollectionSelector();
  const defaultArray = [];
  return createSelector(
    articleFragmentsSelector,
    collectionSelector,
    groupNameSelector,
    stageSelector,
    (articleFragments, collection, groupName, stage) => {
      if (
        !collection ||
        !collection.groups ||
        !collection.articleFragments[stage]
      ) {
        return defaultArray;
      }
      const numberOfGroups = collection.groups ? collection.groups.length : 0;
      const groupDisplayIndex = collection.groups.indexOf(groupName);
      if (groupDisplayIndex === -1) {
        return defaultArray;
      }
      const groupNumber = numberOfGroups - groupDisplayIndex - 1;
      return collection.articleFragments[stage].filter(id => {
        const articleFragment = articleFragments[id];
        const articleGroup =
          articleFragment.meta && articleFragment.meta.group
            ? parseInt(articleFragment.meta.group, 10)
            : 0;
        return articleGroup === groupNumber;
      });
    }
  );
};

const collectionIdsSelector = (
  state,
  { collectionIds }: { collectionIds: string[] }
) => collectionIds;

const createCollectionsAsTreeSelector = () =>
  createSelector(
    collectionsSelector,
    articleFragmentsSelector,
    collectionIdsSelector,
    stageSelector,
    (collections, articleFragments, collectionIds, stage) => {
      const createNestedArticleFragment = articleFragmentId =>
        articleFragments[articleFragmentId].meta &&
        articleFragments[articleFragmentId].meta.supporting
          ? {
              ...articleFragments[articleFragmentId],
              meta: {
                ...articleFragments[articleFragmentId].meta,
                supporting: articleFragments[
                  articleFragmentId
                ].meta.supporting.map(
                  supportingFragmentId => articleFragments[supportingFragmentId]
                )
              }
            }
          : { ...articleFragments[articleFragmentId] };

      return collectionIds.reduce(
        (acc, collectionId) => ({
          collections: !collections[collectionId]
            ? acc.collections
            : [
                ...acc.collections,
                {
                  ...omit(collections[collectionId], 'articleFragments'),
                  groups: collections[collectionId].groups
                    ? collections[collectionId].groups.map(
                        (groupId, index) => ({
                          id: groupId,
                          articleFragments: (
                            collections[collectionId].articleFragments[stage] ||
                            []
                          )
                            .filter(
                              // There are obviously better ways to sort articles into groups!
                              articleFragmentId =>
                                articleFragments[articleFragmentId].meta &&
                                articleFragments[articleFragmentId].meta.group
                                  ? parseInt(
                                      articleFragments[articleFragmentId].meta
                                        .group,
                                      10
                                    ) ===
                                    collections[collectionId].groups.length -
                                      index -
                                      1
                                  : 0
                            )
                            .map(createNestedArticleFragment)
                        })
                      )
                    : [
                        {
                          articleFragments: (
                            collections[collectionId].articleFragments[stage] ||
                            []
                          ).map(createNestedArticleFragment)
                        }
                      ]
                }
              ]
        }),
        { collections: [] }
      );
    }
  );

// Selects the shared part of the application state mounted at its default point, '.shared'.
const selectSharedState = (rootState: { shared: State }) => rootState.shared;

export {
  externalArticlesSelector,
  externalArticleFromArticleFragmentSelector,
  createArticleFromArticleFragmentSelector,
  createArticlesInCollectionGroupSelector,
  createCollectionSelector,
  selectSharedState,
  createCollectionsAsTreeSelector
};
