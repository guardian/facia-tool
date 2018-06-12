// @flow

import { type Action } from '../types/Action';
import type { Collection } from '../types/Collection';

type State = {
  [string]: Collection
};

const collections = (state: State = {}, action: Action) => {
  switch (action.type) {
    case 'SHARED/COLLECTION_RECEIVED': {
      const { payload } = action;
      return Object.assign({}, state, { [payload.id]: payload });
    }
    case 'SHARED/REMOVE_COLLECTION_ARTICLE_FRAGMENT': {
      const { id, articleFragmentId, browsingStage } = action.payload;
      const collection = state[id];
      const prevArticleFragments =
        collection.articleFragments[browsingStage] || [];
      return {
        ...state,
        [id]: {
          ...collection,
          articleFragments: {
            ...collection.articleFragments,
            [browsingStage]: prevArticleFragments.filter(
              sid => sid !== articleFragmentId
            )
          }
        }
      };
    }
    case 'SHARED/ADD_COLLECTION_ARTICLE_FRAGMENT': {
      const { id, index, articleFragmentId, browsingStage } = action.payload;
      const collection = state[id];
      const prevArticleFragments =
        collection.articleFragments[browsingStage] || [];
      return {
        ...state,
        [id]: {
          ...collection,
          articleFragments: {
            ...collection.articleFragments,
            [browsingStage]: [
              ...prevArticleFragments.slice(0, index),
              articleFragmentId,
              ...prevArticleFragments.slice(index)
            ]
          }
        }
      };
    }
    default: {
      return state;
    }
  }
};

export default collections;
