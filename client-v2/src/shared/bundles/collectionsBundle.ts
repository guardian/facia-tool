import { State as SharedState } from '../types/State';
import createAsyncResourceBundle from '../util/createAsyncResourceBundle';
import { Collection } from 'shared/types/Collection';

const {
  actions,
  actionNames,
  reducer,
  selectors,
  initialState
} = createAsyncResourceBundle<Collection>('collections', { indexById: true });

const collectionSelectors = {
  ...selectors,
  selectParentCollectionOfArticleFragment: (
    state: SharedState,
    articleFragmentId: string
  ) => {
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

export {
  actions,
  actionNames,
  collectionSelectors as selectors,
  reducer,
  initialState
};
