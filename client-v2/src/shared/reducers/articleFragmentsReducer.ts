import { Action } from '../types/Action';
import { insertAndDedupeSiblings } from '../util/insertAndDedupeSiblings';
import { State } from './sharedReducer';
import { articleFragmentsSelector } from 'shared/selectors/shared';
import {
  UPDATE_ARTICLE_FRAGMENT_META,
  ARTICLE_FRAGMENTS_RECEIVED,
  CLEAR_ARTICLE_FRAGMENTS,
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
          meta: action.payload.meta
        }
      };
    }
    case CLEAR_ARTICLE_FRAGMENTS: {
      return action.payload.ids.reduce((newState, id) => {
        const { [id]: omit, ...rest } = newState;
        return rest;
      }, state);
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

      if (!insertedArticleFragment) {
        // this may have happened if we've purged after a poll
        return state;
      }

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
    // We add frontPublicationDates here  because sublinks coming from the old tool do not have front publication
    // dates. The new fronts tool adds these to sublinks always.
    case 'SHARED/MAYBE_ADD_FRONT_PUBLICATION': {
      const { id, date } = action.payload;
      const fragment = state[id];

      if (fragment.frontPublicationDate) {
        return state;
      }

      const newFragment = { ...fragment, frontPublicationDate: date };
      return {
        ...state,
        [id]: newFragment
      };
    }

    default: {
      return state;
    }
  }
};

export default articleFragments;
