// @flow

import { createSelector } from 'reselect';

import type { ArticleFragment } from '../types/Shared';
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

const collectionIdSelector = (_, { collectionId }) => collectionId;

const createCollectionSelector = () =>
  createSelector(
    collectionsSelector,
    collectionIdSelector,
    (collections, id) => collections[id]
  );

const groupDisplayIndexSelector = (
  _,
  { groupDisplayIndex }: { groupDisplayIndex: number }
) => groupDisplayIndex;

const stageSelector = (_, { stage }: { stage: string }) => stage;

const createArticlesInCollectionGroupSelector = () => {
  const collectionSelector = createCollectionSelector();
  const defaultArray = [];
  return createSelector(
    articleFragmentsSelector,
    collectionSelector,
    groupDisplayIndexSelector,
    stageSelector,
    (articleFragments, collection, groupDisplayIndex, stage) => {
      if (!collection || !collection.groups || !collection.articles[stage]) {
        return defaultArray;
      }
      const numberOfGroups = collection.groups.length;
      const groupNumber = numberOfGroups - groupDisplayIndex - 1;
      return collection.articles[stage].filter(id => {
        const articleFragment = articleFragments[id];
        const articleGroup = articleFragment.meta.group
          ? parseInt(articleFragment.meta.group, 10)
          : 0;
        return articleGroup === groupNumber;
      });
    }
  );
};

export {
  externalArticlesSelector,
  externalArticleFromArticleFragmentSelector,
  createArticleFromArticleFragmentSelector,
  createArticlesInCollectionGroupSelector
};
