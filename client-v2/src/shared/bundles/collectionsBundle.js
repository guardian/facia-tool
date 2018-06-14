// @flow

import createAsyncResourceBundle, {
  type State
} from '../util/createAsyncResourceBundle';
import { type Action } from '../types/Action';
import { type Collection } from '../types/Collection';

const {
  actions,
  actionNames,
  reducer,
  selectors,
  initialState
} = createAsyncResourceBundle('collections', { indexById: true });

const collectionReducer = (
  incomingState: State<Collection> = initialState,
  action: Action
) => {
  const state = reducer(incomingState, (action: any));
  switch (action.type) {
    case 'SHARED/REMOVE_COLLECTION_ARTICLE_FRAGMENT': {
      const { id, articleFragmentId, browsingStage } = action.payload;
      const collection = state.data[id];
      const prevArticleFragments =
        collection.articleFragments[browsingStage] || [];
      return {
        ...state,
        data: {
          ...state.data,
          [id]: {
            ...collection,
            articleFragments: {
              ...collection.articleFragments,
              [browsingStage]: prevArticleFragments.filter(
                sid => sid !== articleFragmentId
              )
            }
          }
        }
      };
    }
    case 'SHARED/ADD_COLLECTION_ARTICLE_FRAGMENT': {
      const { id, index, articleFragmentId, browsingStage } = action.payload;
      const collection = state.data[id];
      const prevArticleFragments =
        collection.articleFragments[browsingStage] || [];
      return {
        ...state,
        data: {
          ...state.data,
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
        }
      };
    }
    default: {
      return state;
    }
  }
};

export { actions, actionNames, selectors, collectionReducer as reducer };
