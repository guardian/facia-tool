// @flow

import { createSelector } from 'reselect';
import { omit } from 'lodash';
import { selectors as externalArticleSelectors } from '../bundles/externalArticlesBundle';
import { selectors as collectionSelectors } from '../bundles/collectionsBundle';

import type { ArticleFragment } from '../types/Collection';
import type { State } from '../types/State';

// Selects the shared part of the application state mounted at its default point, '.shared'.
const selectSharedState = (rootState: any): State => rootState.shared;

const articleFragmentsSelector = (state: State) => state.articleFragments;

const articleFragmentsFromRootStateSelector = createSelector(
  [selectSharedState],
  (state: State) => articleFragmentsSelector(state)
);

const articleFragmentSelector = (state: State, id: string): ArticleFragment =>
  state.articleFragments[id];

const externalArticleFromArticleFragmentSelector = (
  state: State,
  id: string
) => {
  const articleFragment = articleFragmentSelector(state, id);
  const externalArticles = externalArticleSelectors.selectAll(state);
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

const collectionIdSelector = (_, { collectionId }: { collectionId: string }) =>
  collectionId;

const createCollectionSelector = () =>
  createSelector(
    collectionSelectors.selectAll,
    collectionIdSelector,
    (collections, id) =>
      collections[id]
        ? {
            ...collections[id],
            groups:
              collections[id].groups && collections[id].groups.slice().reverse()
          }
        : false
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
      const groupDisplayIndex = collection.groups.indexOf(groupName);
      if (groupDisplayIndex === -1) {
        return defaultArray;
      }
      return collection.articleFragments[stage].filter(id => {
        const articleFragment = articleFragments[id];
        const articleGroup =
          articleFragment.meta && articleFragment.meta.group
            ? parseInt(articleFragment.meta.group, 10)
            : 0;
        return articleGroup === groupDisplayIndex;
      });
    }
  );
};

const collectionIdsSelector = (
  state,
  { collectionIds }: { collectionIds: string[] }
) => collectionIds;

const clipboardContentSelector = state => state.clipboard;

const clipboardAsTreeSelector = createSelector(
  [clipboardContentSelector, articleFragmentsFromRootStateSelector],
  (clipboardContent, articleFragments) => {
    if (Object.keys(clipboardContent).length === 0) {
      return {};
    }
    const createNestedArticleFragment = (articleFragmentId: string) =>
      articleFragments[articleFragmentId].meta &&
      articleFragments[articleFragmentId].meta.supporting
        ? {
            ...articleFragments[articleFragmentId],
            meta: {
              ...articleFragments[articleFragmentId].meta,
              supporting: articleFragments[
                articleFragmentId
              ].meta.supporting.map(
                (supportingFragmentId: string) =>
                  articleFragments[supportingFragmentId]
              )
            }
          }
        : { ...articleFragments[articleFragmentId] };

    return {
      articleFragments: clipboardContent.map(fragmentId =>
        createNestedArticleFragment(fragmentId)
      )
    };
  }
);

const createCollectionsAsTreeSelector = () =>
  createSelector(
    collectionSelectors.selectAll,
    articleFragmentsSelector,
    collectionIdsSelector,
    stageSelector,
    (collections, articleFragments, collectionIds, stage) => {
      const createNestedArticleFragment = (articleFragmentId: string) =>
        articleFragments[articleFragmentId].meta &&
        articleFragments[articleFragmentId].meta.supporting
          ? {
              ...articleFragments[articleFragmentId],
              meta: {
                ...articleFragments[articleFragmentId].meta,
                supporting: articleFragments[
                  articleFragmentId
                ].meta.supporting.map(
                  (supportingFragmentId: string) =>
                    articleFragments[supportingFragmentId]
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
                                    (collections[collectionId].groups || [])
                                      .length -
                                      index -
                                      1
                                  : 0
                            )
                            .map(createNestedArticleFragment)
                        })
                      )
                    : [
                        {
                          id: '',
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

export {
  externalArticleFromArticleFragmentSelector,
  createArticleFromArticleFragmentSelector,
  createArticlesInCollectionGroupSelector,
  createCollectionSelector,
  selectSharedState,
  createCollectionsAsTreeSelector,
  articleFragmentSelector,
  clipboardAsTreeSelector
};
