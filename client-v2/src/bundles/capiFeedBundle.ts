import createAsyncResourceBundle from 'lib/createAsyncResourceBundle';
import { CapiArticle } from 'types/Capi';
import { ThunkResult } from 'types/Store';
import { previewCapi, liveCapi } from 'services/frontsCapi';
import { checkIsContent } from 'services/capiQuery';

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
  selectLocalState: state => state.capiPreviewFeed,
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

export {
  liveActions,
  previewActions,
  capiLiveFeed,
  capiPreviewFeed,
  liveSelectors,
  previewSelectors
};
