import { State as SharedState } from '../types/State';
import createAsyncResourceBundle, {
  State,
  Actions
} from 'lib/createAsyncResourceBundle';
import { Collection } from 'shared/types/Collection';
import { addPersistMetaToAction } from '../../util/action';
import set from 'lodash/fp/set';

const collectionsEntityName = 'collections';

const {
  actions,
  actionNames,
  reducer,
  selectors,
  initialState
} = createAsyncResourceBundle<Collection>(collectionsEntityName, {
  indexById: true
});

const collectionSelectors = {
  ...selectors,
  selectParentCollectionOfArticleFragment: (
    state: SharedState,
    articleFragmentId: string
  ): string | null => {
    let collectionId: null | string = null;
    Object.keys(state.collections.data).some(id =>
      ['live', 'draft', 'previously'].some(stage => {
        const groups = state.collections.data[id][stage] || [];

        return groups.some((gId: string) => {
          const articleFragments = state.groups[gId].articleFragments || [];
          if (articleFragments.indexOf(articleFragmentId) !== -1) {
            collectionId = id;
            return true;
          }

          return articleFragments.some((afId: string) => {
            if (
              state.articleFragments[afId] &&
              state.articleFragments[afId].meta &&
              state.articleFragments[afId].meta.supporting &&
              state.articleFragments[afId].meta.supporting!.indexOf(
                articleFragmentId
              ) !== -1
            ) {
              collectionId = id;
              return true;
            }
            return false;
          });
        });
      })
    );
    return collectionId;
  }
};

const SET_HIDDEN = 'SET_HIDDEN' as 'SET_HIDDEN';

const setHidden = (collectionId: string, isHidden: boolean) => ({
  entity: collectionsEntityName,
  type: SET_HIDDEN,
  payload: {
    collectionId,
    isHidden
  }
});

const setHiddenAndPersist = addPersistMetaToAction(setHidden, {
  persistTo: 'collection',
  key: 'collectionId',
  entity: 'collection'
});

export type SetHidden = ReturnType<typeof setHidden>;

const collectionActions = {
  ...actions,
  setHiddenAndPersist
};

type CollectionActions = Actions<Collection> | SetHidden;

const collectionReducer = (
  state: State<Collection>,
  action: CollectionActions
): State<Collection> => {
  const updatedState = reducer(state, action);
  switch (action.type) {
    case SET_HIDDEN: {
      if (!updatedState.data[action.payload.collectionId]) {
        return updatedState;
      }

      return set(
        ['data', action.payload.collectionId, 'isHidden'],
        action.payload.isHidden,
        updatedState
      );
    }
    default: {
      return updatedState;
    }
  }
};

export {
  collectionActions as actions,
  actionNames,
  collectionSelectors as selectors,
  collectionReducer as reducer,
  initialState
};
