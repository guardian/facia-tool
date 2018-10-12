

import { Action } from '../types/Action';
import { ArticleFragment } from '../types/Collection';

type State = {
  [id: string]: ArticleFragment
};

const articleFragments = (state: State = {}, action: Action) => {
  switch (action.type) {
    case 'SHARED/UPDATE_ARTICLE_FRAGMENT_META': {
      return {
        ...state,
        [action.payload.id]: {
          ...state[action.payload.id],
          meta: action.payload.meta
        }
      };
    }
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
      const target = state[id];
      const targetMeta = target.meta || {};
      const targetSupporting = targetMeta.supporting || [];

      const source = state[supportingArticleFragmentId];
      const sourceMeta = source.meta || {};
      const sourceSupporting = sourceMeta.supporting || [];

      return {
        ...state,
        [id]: {
          ...target,
          meta: {
            ...targetMeta,
            supporting: [
              ...targetSupporting.slice(0, index),
              supportingArticleFragmentId,
              // Flatten: add the supporting from the source ...
              ...sourceSupporting,
              ...targetSupporting.slice(index)
            ]
          }
        },
        //
        [supportingArticleFragmentId]: {
          ...source,
          meta: {
            ...sourceMeta,
            // ...and remove it from here
            supporting: []
          }
        }
      };
    }
    case 'SHARED/REPLACE_ARTICLE_FRAGMENT_SUPPORTING': {
      const { id, supporting } = action.payload;
      const group = state[id];

      return {
        ...state,
        [id]: {
          ...group,
          meta: {
            ...state[id].meta,
            supporting
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
