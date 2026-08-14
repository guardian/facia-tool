import { createIndexedAsyncResourceBundle } from 'lib/createAsyncResourceBundle';
import {
	CapiArticle,
	CapiInteractiveAtom,
	isCapiInteractiveAtom,
} from 'types/Capi';
import { ThunkResult } from 'types/Store';
import { previewCapi, liveCapi } from 'services/capiQuery';
import { checkIsContent } from 'services/capiQuery';
import { getPrefills } from 'services/editionsApi';
import { Dispatch } from 'redux';
import type { State } from 'types/State';
import { createSelectIsArticleStale } from 'util/externalArticle';

type FeedState = CapiArticle | CapiInteractiveAtom;

export type FeedEntry =
	| { type: 'article'; id: string }
	| { type: 'atom'; id: string };

const {
	actions: liveActions,
	reducer: capiLiveFeed,
	selectors: liveSelectors,
} = createIndexedAsyncResourceBundle<FeedState>('capiLiveFeed', {
	selectLocalState: (state) => state.feed.capiLiveFeed,
});

const isNonCommercialArticle = (
	article: CapiArticle | CapiInteractiveAtom | undefined,
): boolean => {
	if (!article) {
		return true;
	}

	if (isCapiInteractiveAtom(article)) {
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
} = createIndexedAsyncResourceBundle<FeedState>('capiPreviewFeed', {
	selectLocalState: (state) => state.feed.capiPreviewFeed,
});

const fetchResourceOrResults = async (
	capiService: typeof liveCapi,
	params: object & { includeAtoms?: boolean },
	isResource: boolean,
	fetchFromPreview: boolean = false,
) => {
	const { includeAtoms, ...capiParams } = params as any;
	const capiEndpoint = fetchFromPreview
		? capiService.scheduled
		: capiService.search;

	const mainRequest = capiEndpoint(capiParams, { isResource });
	const atomsRequest =
		includeAtoms && !isResource
			? capiService.atoms({ q: capiParams.q })
			: Promise.resolve(null);

	const [{ response }, atomsResponse] = await Promise.all([
		mainRequest,
		atomsRequest,
	]);

	const atomResults: CapiInteractiveAtom[] = atomsResponse
		? atomsResponse.response.results
		: [];

	return {
		results: checkIsContent(response)
			? [response.content]
			: [...response.results, ...atomResults],
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
				const updatedResults = nonCommercialResults.filter((article) => {
					const lastModified = isCapiInteractiveAtom(article)
						? article.contentChangeDetails.lastModified?.date
						: article.fields.lastModified;
					return selectIsArticleStale(getState(), article.id, lastModified);
				});

				dispatch(
					actions.fetchSuccess(updatedResults, {
						pagination: resultData.pagination || undefined,
						order: nonCommercialResults.map((item) => item.id),
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
} = createIndexedAsyncResourceBundle<FeedState>('prefillFeed', {
	selectLocalState: (state) => state.feed.prefillFeed,
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
				const filteredResults = response.results.filter(isNonCommercialArticle);
				dispatch(
					prefillActions.fetchSuccess(filteredResults, {
						order: filteredResults.map((item) => item.id),
						pagination: {
							totalPages: response.pages,
							currentPage: response.currentPage,
							pageSize: response.pageSize,
						},
					}),
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
): CapiArticle | CapiInteractiveAtom | undefined =>
	liveSelectors.selectById(state, id) ||
	previewSelectors.selectById(state, id) ||
	prefillSelectors.selectById(state, id);

/** Derive typed FeedEntry[] from a bundle's ID list by looking up each item's type. */
const selectFeedEntries =
	(
		selectById: (state: State, id: string) => FeedState | undefined,
		selectIds: (state: State) => string[],
	) =>
	(state: State): FeedEntry[] =>
		selectIds(state).map((id) => {
			const item = selectById(state, id);
			return {
				type:
					item && isCapiInteractiveAtom(item)
						? ('atom' as const)
						: ('article' as const),
				id,
			};
		});

export const selectLiveFeedEntries = selectFeedEntries(
	liveSelectors.selectById,
	liveSelectors.selectLastFetchOrder,
);
export const selectPreviewFeedEntries = selectFeedEntries(
	previewSelectors.selectById,
	previewSelectors.selectLastFetchOrder,
);
export const selectPrefillFeedEntries = selectFeedEntries(
	prefillSelectors.selectById,
	prefillSelectors.selectLastFetchOrder,
);

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
