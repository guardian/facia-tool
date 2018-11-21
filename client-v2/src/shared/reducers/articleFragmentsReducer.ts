import { Action } from '../types/Action';
import { ArticleFragment } from '../types/Collection';
import { insertAndDedupeSiblings } from './utils';

interface State {
  [uuid: string]: ArticleFragment;
}

const articleFragments = (state: State = {}, action: Action) => {
  switch (action.type) {
    case 'SHARED/UPDATE_ARTICLE_FRAGMENT_META': {
      const { id } = action.payload;
      return {
        ...state,
        [id]: {
          ...state[id],
          meta: {
            ...(state[id].meta || {}),
            ...action.payload.meta
          }
        }
      };
    }
    case 'SHARED/ARTICLE_FRAGMENTS_RECEIVED': {
      const { payload } = action;
      return Object.assign({}, state, payload);
    }
    case 'SHARED/REMOVE_ARTICLE_FRAGMENT': {
      const { id, articleFragmentId, parentType } = action.payload;
      if (parentType !== 'articleFragment') {
        return state;
      }
      const articleFragment = state[id];
      return {
        ...state,
        [id]: {
          ...articleFragment,
          meta: {
            ...articleFragment.meta,
            supporting: (articleFragment.meta.supporting || []).filter(
              sid => sid !== articleFragmentId
            )
          }
        }
      };
    }
    case 'SHARED/INSERT_ARTICLE_FRAGMENT': {
      const {
        to: { id: toId, type: toType, index },
        id,
        articleFragmentMap
      } = action.payload;
      if (toType !== 'articleFragment') {
        return state;
      }
      const targetArticleFragment = state[toId];
      const insertedArticleFragment = state[id];
      const supporting = insertAndDedupeSiblings(
        targetArticleFragment.meta.supporting || [],
        [
          insertedArticleFragment.uuid,
          ...(insertedArticleFragment.meta.supporting || [])
        ],
        index,
        articleFragmentMap
      );

      return {
        ...state,
        [toId]: {
          ...targetArticleFragment,
          meta: {
            ...targetArticleFragment.meta,
            supporting
          }
        },
        //
        [id]: {
          ...insertedArticleFragment,
          meta: {
            ...insertedArticleFragment.meta,
            // ...ensuer that after flattening we remove the supporting from
            // the inserted article fragment
            supporting: []
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
