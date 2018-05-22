// @flow

import { createSelector } from 'reselect';

import type { ArticleFragment } from '../types/Collection';
import type { State } from '../types/State';

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
      return {
        ...externalArticle,
        ...{ group }
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
      if (!collection || !collection.groups || !collection.articles[stage]) {
        return defaultArray;
      }
      const groupDisplayIndex = collection.groups.indexOf(groupName);
      if (groupDisplayIndex === -1) {
        return defaultArray;
      }
      return collection.articles[stage].filter(id => {
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

// Selects the shared part of the application state mounted at its default point, '.shared'.
const selectSharedState = (rootState: { shared: State }) => rootState.shared;

export {
  externalArticlesSelector,
  externalArticleFromArticleFragmentSelector,
  createArticleFromArticleFragmentSelector,
  createArticlesInCollectionGroupSelector,
  createCollectionSelector,
  selectSharedState
};
