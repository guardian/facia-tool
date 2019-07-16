import createAsyncResourceBundle from 'lib/createAsyncResourceBundle';
import { CapiArticle } from 'types/Capi';
import { ThunkResult } from 'types/Store';
import { previewCapi, liveCapi } from 'services/frontsCapi';
import { checkIsContent } from 'services/capiQuery';
import { getPrefills } from 'services/editionsApi';
import { Dispatch } from 'redux';
import { PrefillModeOn, PrefillModeOff } from 'types/Action';

type FeedState = CapiArticle[];

const {
  actions: liveActions,
  reducer: capiLiveFeed,
  selectors: liveSelectors
} = createAsyncResourceBundle<FeedState>('capiLiveFeed', {
  indexById: false,
  selectLocalState: state => state.capi.capiLiveFeed,
  initialData: []
});

const isNonCommercialArticle = (article: CapiArticle | undefined): boolean => {
  if (!article) {
    return true;
  }

  if (article.isHosted) {
    return false;
  }

  if (!article.tags) {
    return true;
  }

  return article.tags.every(tag => tag.type !== 'paid-content');
};

const {
  actions: previewActions,
  reducer: capiPreviewFeed,
  selectors: previewSelectors
} = createAsyncResourceBundle<FeedState>('capiPreviewFeed', {
  indexById: false,
  selectLocalState: state => state.capi.capiPreviewFeed,
  initialData: []
});

const fetchResourceOrResults = async (
  capiService: typeof liveCapi,
  params: object,
  isResource: boolean,
  fetchFromPreview: boolean = false
) => {
  const capiEndpoint = fetchFromPreview
    ? capiService.scheduled
    : capiService.search;
  const { response } = await capiEndpoint(params, { isResource });

  return {
    results: checkIsContent(response) ? [response.content] : response.results,
    pagination: checkIsContent(response)
      ? null
      : {
          totalPages: response.pages,
          currentPage: response.currentPage,
          pageSize: response.pageSize
        }
  };
};

export const fetchLive = (
  params: object,
  isResource: boolean
): ThunkResult<void> => async dispatch => {
  dispatch(liveActions.fetchStart('live'));
  let resultData;
  try {
    resultData = await fetchResourceOrResults(liveCapi, params, isResource);
  } catch (e) {
    return dispatch(liveActions.fetchError(e.message));
  }

  if (resultData) {
    const nonCommercialResults = resultData.results.filter(
      isNonCommercialArticle
    );
    dispatch(
      liveActions.fetchSuccess(nonCommercialResults, resultData.pagination)
    );
  }
};

export const fetchPreview = (
  params: object,
  isResource: boolean
): ThunkResult<void> => async dispatch => {
  dispatch(previewActions.fetchStart('preview'));
  let resultData;
  try {
    resultData = await fetchResourceOrResults(
      previewCapi,
      params,
      isResource,
      true
    );
  } catch (e) {
    dispatch(previewActions.fetchError(e.message));
  }
  if (resultData) {
    const nonCommercialResults = resultData.results.filter(
      isNonCommercialArticle
    );
    dispatch(
      previewActions.fetchSuccess(nonCommercialResults, resultData.pagination)
    );
  }
};

const {
  actions: prefillActions,
  reducer: prefillFeed,
  selectors: prefillSelectors
} = createAsyncResourceBundle<FeedState>('prefillFeed', {
  indexById: false,
  selectLocalState: state => state.capi.prefillFeed,
  initialData: []
});

export const fetchPrefill = (
  id: string
): ThunkResult<void> => async dispatch => {
  dispatch({
    type: 'FEED_STATE_IS_PREFILL_MODE',
    payload: { isPrefillMode: true }
  });
  dispatch(prefillActions.fetchStart('prefill'));

  try {
    const { response } = await getPrefills(id);
    if (!checkIsContent(response)) {
      dispatch(
        prefillActions.fetchSuccess(
          response.results.filter(isNonCommercialArticle, {
            totalPages: response.pages,
            currentPage: response.currentPage,
            pageSize: response.pageSize
          })
        )
      );
    }
  } catch (e) {
    dispatch(prefillActions.fetchError(e.message));
  }
};

export const hidePrefills = () => (dispatch: Dispatch) => {
  dispatch({
    type: 'FEED_STATE_IS_PREFILL_MODE',
    payload: { isPrefillMode: false }
  });
};

export {
  liveActions,
  previewActions,
  prefillActions,
  capiLiveFeed,
  capiPreviewFeed,
  prefillFeed,
  liveSelectors,
  previewSelectors,
  prefillSelectors
};
