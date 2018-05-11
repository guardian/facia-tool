// @flow

import { createSelector } from 'reselect';

import type { ExternalArticle, ArticleFragment } from '../types/Shared';
import type { State } from '../types/State';

const getExternalArticles = (state: State) => state.externalArticles;
const getArticleFragmentFromId = (state: State, id: string): ArticleFragment =>
  state.articleFragments[id];
const getExternalArticleFromArticleFragmentId = (
  state: State,
  id: string
): ExternalArticle | null => {
  const articleFragment = getArticleFragmentFromId(state, id);
  if (!articleFragment) {
    return null;
  }
  const articleId = articleFragment.id.split('/')[2];
  const externalArticles = getExternalArticles(state);
  return externalArticles[articleId] || null;
};

const getArticleFromArticleFragment = createSelector(
  [getArticleFragmentFromId, getExternalArticleFromArticleFragmentId],
  (articleFragment, externalArticle) => {
    const group =
      (articleFragment.meta && articleFragment.meta.group) || undefined;
    return {
      ...externalArticle,
      ...{ group }
    };
  }
);

export { getExternalArticles, getArticleFromArticleFragment };
