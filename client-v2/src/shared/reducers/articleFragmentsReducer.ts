import { Action } from '../types/Action';
import { insertAndDedupeSiblings } from '../util/insertAndDedupeSiblings';
import { State } from './sharedReducer';
import { articleFragmentsSelector } from 'shared/selectors/shared';
import {
  UPDATE_ARTICLE_FRAGMENT_META,
  ARTICLE_FRAGMENTS_RECEIVED,
  REMOVE_SUPPORTING_ARTICLE_FRAGMENT,
  INSERT_SUPPORTING_ARTICLE_FRAGMENT
} from 'shared/actions/ArticleFragments';

const articleFragments = (
  state: State['articleFragments'] = {},
  action: Action,
  prevSharedState: State
) => {
  switch (action.type) {
    case UPDATE_ARTICLE_FRAGMENT_META: {
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
    case ARTICLE_FRAGMENTS_RECEIVED: {
      const { payload } = action;
      return Object.assign({}, state, payload);
    }
    case REMOVE_SUPPORTING_ARTICLE_FRAGMENT: {
      const articleFragment = state[action.payload.id];
      return {
        ...state,
        [action.payload.id]: {
          ...articleFragment,
          meta: {
            ...articleFragment.meta,
            supporting: (articleFragment.meta.supporting || []).filter(
              sid => sid !== action.payload.articleFragmentId
            )
          }
        }
      };
    }
    case INSERT_SUPPORTING_ARTICLE_FRAGMENT: {
      const { id, articleFragmentId, index } = action.payload;
      const targetArticleFragment = state[id];
      const insertedArticleFragment = state[articleFragmentId];
      const supporting = insertAndDedupeSiblings(
        targetArticleFragment.meta.supporting || [],
        [
          insertedArticleFragment.uuid,
          ...(insertedArticleFragment.meta.supporting || [])
        ],
        index,
        articleFragmentsSelector(prevSharedState)
      );

      return {
        ...state,
        [id]: {
          ...targetArticleFragment,
          meta: {
            ...targetArticleFragment.meta,
            supporting
          }
        },
        //
        [articleFragmentId]: {
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
