// @flow

import { createSelector } from 'reselect';

import type { State } from 'Types/State';
import type { CollectionArticles } from 'Types/Collection';
import type { CapiArticle } from 'Types/Capi';

const allCollectionArticlesSelector = (
  state: State
): { [string]: CollectionArticles } => state.collectionArticles;

const collectionIdSelector = (state: State, id: string) => id;

const articleStageSelector = (state: State, id: string, stage: string) => stage;

const getCollectionArticles = (
  collectionArticles: { [string]: CollectionArticles },
  id: string,
  stage: string
): Array<CapiArticle> => {
  if (!collectionArticles || !collectionArticles[id]) {
    return [];
  }

  switch (stage) {
    case 'live': {
      return collectionArticles[id].live;
    }
    case 'draft': {
      return collectionArticles[id].draft;
    }
    default: {
      return [];
    }
  }
};

const collectionArticlesSelector = createSelector(
  [allCollectionArticlesSelector, collectionIdSelector, articleStageSelector],
  getCollectionArticles
);

export { collectionArticlesSelector };
