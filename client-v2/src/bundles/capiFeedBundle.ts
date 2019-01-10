import createAsyncResourceBundle from 'lib/createAsyncResourceBundle';
import { CapiArticle } from 'types/Capi';
import { ThunkResult } from 'types/Store';
import { State } from 'types/State';
import { previewCapi, liveCapi } from 'services/frontsCapi';

interface FeedState {
  live: CapiArticle[];
  preview: CapiArticle[];
}

const {
  actions,
  // actionNames,
  reducer,
  selectors: { selectAll, selectIsLoadingById }
  // initialState
} = createAsyncResourceBundle<FeedState>('capiFeed', {
  indexById: false,
  selectLocalState: state => state.capiFeed,
  initialData: {
    live: [],
    preview: []
  }
});

export const fetchLive = (
  params: object,
  isResource: boolean
): ThunkResult<void> => (dispatch, getState) => {
  dispatch(actions.fetchStart('live'));
  liveCapi.search(params, { isResource }).then(response => {
    const { results } = response.response;
    const state = selectAll(getState());
    if (results) {
      dispatch(
        actions.fetchSuccess(
          {
            ...state,
            live: results
          },
          'live'
        )
      );
    }
  });
};

export const fetchPreview = (
  params: object,
  isResource: boolean
): ThunkResult<void> => (dispatch, getState) => {
  dispatch(actions.fetchStart('preview'));
  previewCapi.search(params, { isResource }).then(response => {
    const { results } = response.response;
    const state = selectAll(getState());
    if (results) {
      dispatch(
        actions.fetchSuccess(
          {
            ...state,
            preview: results
          },
          'preview'
        )
      );
    }
  });
};

const selectLiveFeed = (state: State): FeedState['live'] =>
  selectAll(state).live;
const selectPreviewFeed = (state: State): FeedState['preview'] =>
  selectAll(state).preview;
const selectLiveLoading = (state: State) => selectIsLoadingById(state, 'live');
const selectPreviewLoading = (state: State) =>
  selectIsLoadingById(state, 'preview');

export {
  actions,
  reducer,
  selectLiveFeed,
  selectPreviewFeed,
  selectLiveLoading,
  selectPreviewLoading
};
