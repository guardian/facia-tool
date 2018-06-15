// @flow

import createAsyncResourceBundle, {
  type State
} from '../util/createAsyncResourceBundle';
import { type Action } from '../types/Action';
import { type Collection } from '../types/Collection';
import { type State as SharedState } from '../types/State';

const {
  actions,
  actionNames,
  reducer,
  selectors,
  initialState
} = createAsyncResourceBundle('collections', { indexById: true });

const collectionSelectors = {
  ...selectors,
  selectParentCollectionOfArticleFragment: (
    state: SharedState,
    articleFragmentId: string
  ) => {
    let collectionId = null;
    Object.keys(state.collections.data).some(id =>
      Object.keys(state.collections.data[id].articleFragments).some(stage => {
        if (!state.collections.data[id].articleFragments[stage]) {
          return false;
        }
        // If we've got a hit here, stop the search ...
        if (
          state.collections.data[id].articleFragments[stage] &&
          state.collections.data[id].articleFragments[stage].indexOf(
            articleFragmentId
          ) !== -1
        ) {
          collectionId = id;
          return true;
        }
        // ... else, inspect the supporting articles, if they exist.
        state.collections.data[id].articleFragments[stage].some(fragmentId => {
          if (
            state.articleFragments[fragmentId] &&
            state.articleFragments[fragmentId].meta &&
            state.articleFragments[fragmentId].meta.supporting &&
            state.articleFragments[fragmentId].meta.supporting.indexOf(
              articleFragmentId
            ) !== -1
          ) {
            collectionId = id;
            return true;
          }
          return false;
        });
        return false;
      })
    );
    return collectionId;
  }
};

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

export {
  actions,
  actionNames,
  collectionSelectors as selectors,
  collectionReducer as reducer
};
