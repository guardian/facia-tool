import createAsyncResourceBundle from 'lib/createAsyncResourceBundle';
import { CapiArticle } from 'types/Capi';
import { ThunkResult } from 'types/Store';
import { previewCapi, liveCapi } from 'services/frontsCapi';

type FeedState = CapiArticle[];

const {
  actions: liveActions,
  reducer: capiLiveFeed,
  selectors: liveSelectors
} = createAsyncResourceBundle<FeedState>('capiLiveFeed', {
  indexById: false,
  selectLocalState: state => state.capiLiveFeed,
  initialData: []
});

const {
  actions: previewActions,
  reducer: capiPreviewFeed,
  selectors: previewSelectors
} = createAsyncResourceBundle<FeedState>('capiPreviewFeed', {
  indexById: false,
  selectLocalState: state => state.capiPreviewFeed,
  initialData: []
});

const fetchResourceOrResults = async (
  capiService: typeof liveCapi,
  params: object,
  isResource: boolean
) => {
  const res = await capiService.search(params, { isResource });
  return isResource ? [res.response.content] : res.response.results;
}

export const fetchLive = (
  params: object,
  isResource: boolean
): ThunkResult<void> => async dispatch => {
  dispatch(liveActions.fetchStart('live'));
  let results;
  try {
    results = await fetchResourceOrResults(liveCapi, params, isResource);
  } catch (e) {
    dispatch(liveActions.fetchError(e.message));
  }

  if (results) {
    dispatch(liveActions.fetchSuccess(results));
  }
};

export const fetchPreview = (
  params: object,
  isResource: boolean
): ThunkResult<void> => async dispatch => {
  dispatch(previewActions.fetchStart('preview'));
  let results;
  try {
    results = await fetchResourceOrResults(previewCapi, params, isResource);
  } catch (e) {
    dispatch(previewActions.fetchError(e.message));
  }

  if (results) {
    dispatch(previewActions.fetchSuccess(results));
  }
};

export {
  liveActions,
  previewActions,
  capiLiveFeed,
  capiPreviewFeed,
  liveSelectors,
  previewSelectors
};
