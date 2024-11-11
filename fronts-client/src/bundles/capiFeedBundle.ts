import createAsyncResourceBundle from 'lib/createAsyncResourceBundle';
import { CapiArticle } from 'types/Capi';
import { ThunkResult } from 'types/Store';
import { previewCapi, liveCapi } from 'services/capiQuery';
import { checkIsContent } from 'services/capiQuery';
import { getPrefills } from 'services/editionsApi';
import { Dispatch } from 'redux';
import type { State } from 'types/State';
import { createSelectIsArticleStale } from 'util/externalArticle';

type FeedState = CapiArticle;

const {
	actions: liveActions,
	reducer: capiLiveFeed,
	selectors: liveSelectors,
} = createAsyncResourceBundle<FeedState>('capiLiveFeed', {
	selectLocalState: (state) => state.feed.capiLiveFeed,
	indexById: true,
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

	return article.tags.every((tag) => tag.type !== 'paid-content');
};

const {
	actions: previewActions,
	reducer: capiPreviewFeed,
	selectors: previewSelectors,
} = createAsyncResourceBundle<FeedState>('capiPreviewFeed', {
	selectLocalState: (state) => state.feed.capiPreviewFeed,
	indexById: true,
});

const fetchResourceOrResults = async (
	capiService: typeof liveCapi,
	params: object,
	isResource: boolean,
	fetchFromPreview: boolean = false,
) => {
	const capiEndpoint = fetchFromPreview
		? capiService.scheduled
		: capiService.search;
	const { response } = await capiEndpoint(params, { isResource });

	return {
		results: checkIsContent(response) ? [response.content] : response.results,
		pagination: checkIsContent(response)
			? undefined
			: {
					totalPages: response.pages,
					currentPage: response.currentPage,
					pageSize: response.pageSize,
				},
	};
};

export const createFetch =
	(
		actions: typeof liveActions,
		selectIsArticleStale: ReturnType<typeof createSelectIsArticleStale>,
		isPreview: boolean = false,
	) =>
	(params: object, isResource: boolean): ThunkResult<void> =>
	async (dispatch, getState) => {
		dispatch(actions.fetchStart());
		try {
			const resultData = await fetchResourceOrResults(
				isPreview ? previewCapi : liveCapi,
				params,
				isResource,
				isPreview,
			);
			if (resultData) {
				const nonCommercialResults = resultData.results.filter((article) =>
					isNonCommercialArticle(article),
				);
				const updatedResults = nonCommercialResults.filter((article) =>
					selectIsArticleStale(
						getState(),
						article.id,
						article.fields.lastModified,
					),
				);
				dispatch(
					actions.fetchSuccess(updatedResults, {
						pagination: resultData.pagination || undefined,
						order: nonCommercialResults.map((_) => _.id),
					}),
				);
			} else {
				dispatch(actions.fetchSuccessIgnore([]));
			}
		} catch (e) {
			dispatch(actions.fetchError(e));
		}
	};

export const fetchLive = createFetch(
	liveActions,
	createSelectIsArticleStale(liveSelectors.selectById),
);
export const fetchPreview = createFetch(
	previewActions,
	createSelectIsArticleStale(liveSelectors.selectById),
	true,
);

const {
	actions: prefillActions,
	reducer: prefillFeed,
	selectors: prefillSelectors,
} = createAsyncResourceBundle<FeedState>('prefillFeed', {
	selectLocalState: (state) => state.feed.prefillFeed,
	indexById: true,
});

export const fetchPrefill =
	(id: string): ThunkResult<void> =>
	async (dispatch) => {
		dispatch({
			type: 'FEED_STATE_IS_PREFILL_MODE',
			payload: { isPrefillMode: true },
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
							pageSize: response.pageSize,
						}),
					),
				);
			}
		} catch (e) {
			dispatch(prefillActions.fetchError(e));
		}
	};

export const hidePrefills = () => (dispatch: Dispatch) => {
	dispatch({
		type: 'FEED_STATE_IS_PREFILL_MODE',
		payload: { isPrefillMode: false },
	});
};

export const selectArticleAcrossResources = (
	state: State,
	id: string,
): CapiArticle | undefined =>
	liveSelectors.selectById(state, id) ||
	previewSelectors.selectById(state, id) ||
	prefillSelectors.selectById(state, id);

export {
	liveActions,
	previewActions,
	prefillActions,
	capiLiveFeed,
	capiPreviewFeed,
	prefillFeed,
	liveSelectors,
	previewSelectors,
	prefillSelectors,
};
