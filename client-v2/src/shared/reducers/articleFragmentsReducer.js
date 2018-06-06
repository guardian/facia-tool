// @flow

import { type Action } from '../types/Action';
import { type ArticleFragment } from '../types/Collection';

type State = {
  [string]: ArticleFragment
};

const articleFragments = (state: State = {}, action: Action) => {
  switch (action.type) {
    case 'SHARED/ARTICLE_FRAGMENTS_RECEIVED': {
      const { payload } = action;
      return Object.assign({}, state, payload);
    }
    case 'SHARED/REMOVE_SUPPORTING_ARTICLE_FRAGMENT': {
      const { id, supportingArticleFragmentId } = action.payload;
      const articleFragment = state[id];
      return {
        ...state,
        [id]: {
          ...articleFragment,
          meta: {
            ...articleFragment.meta,
            supporting: (articleFragment.meta.supporting || []).filter(
              sid => sid !== supportingArticleFragmentId
            )
          }
        }
      };
    }
    case 'SHARED/ADD_SUPPORTING_ARTICLE_FRAGMENT': {
      const { id, index, supportingArticleFragmentId } = action.payload;
      const articleFragment = state[id];
      const prevMeta = articleFragment.meta || {};
      const prevSupporting = prevMeta.supporting || [];
      return {
        ...state,
        [id]: {
          ...articleFragment,
          meta: {
            ...prevMeta,
            supporting: [
              ...prevSupporting.slice(0, index),
              supportingArticleFragmentId,
              ...prevSupporting.slice(index)
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

export default articleFragments;
