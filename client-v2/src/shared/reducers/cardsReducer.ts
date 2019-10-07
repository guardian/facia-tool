import { Action } from '../types/Action';
import { insertAndDedupeSiblings } from '../util/insertAndDedupeSiblings';
import { State } from './sharedReducer';
import { selectCards } from 'shared/selectors/shared';
import {
  UPDATE_ARTICLE_FRAGMENT_META,
  ARTICLE_FRAGMENTS_RECEIVED,
  CLEAR_ARTICLE_FRAGMENTS,
  REMOVE_SUPPORTING_ARTICLE_FRAGMENT,
  INSERT_SUPPORTING_ARTICLE_FRAGMENT,
  COPY_ARTICLE_FRAGMENT_IMAGE_META
} from 'shared/actions/Cards';
import { cloneActiveImageMeta } from 'shared/util/card';

const cards = (
  state: State['cards'] = {},
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
          meta: action.payload.merge
            ? { ...(state[id].meta || {}), ...action.payload.meta }
            : action.payload.meta
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
      const card = state[action.payload.id];
      return {
        ...state,
        [action.payload.id]: {
          ...card,
          meta: {
            ...card.meta,
            supporting: (card.meta.supporting || []).filter(
              sid => sid !== action.payload.cardId
            )
          }
        }
      };
    }
    case INSERT_SUPPORTING_ARTICLE_FRAGMENT: {
      const { id, cardId, index } = action.payload;
      const targetCard = state[id];
      const insertedCard = state[cardId];

      if (!insertedCard) {
        // this may have happened if we've purged after a poll
        return state;
      }

      const supporting = insertAndDedupeSiblings(
        targetCard.meta.supporting || [],
        [insertedCard.uuid, ...(insertedCard.meta.supporting || [])],
        index,
        selectCards(prevSharedState)
      );

      return {
        ...state,
        [id]: {
          ...targetCard,
          meta: {
            ...targetCard.meta,
            supporting
          }
        },
        //
        [cardId]: {
          ...insertedCard,
          meta: {
            ...insertedCard.meta,
            // ...ensuer that after flattening we remove the supporting from
            // the inserted card
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
    case COPY_ARTICLE_FRAGMENT_IMAGE_META: {
      const to = action.payload.to;
      const fromArticle = state[action.payload.from];
      const toArticle = state[to];
      if (!fromArticle || !toArticle) {
        return state;
      }
      return {
        ...state,
        [to]: {
          ...state[to],
          meta: {
            ...(state[to].meta || {}),
            ...cloneActiveImageMeta(fromArticle)
          }
        }
      };
    }
    default: {
      return state;
    }
  }
};

export default cards;
