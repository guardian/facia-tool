import type { ThunkResult } from 'types/Store';
import type {
	PageViewDataRequested,
	PageViewDataReceived,
} from '../types/Action';
import type { PageViewDataFromOphan, PageViewStory } from 'types/PageViewData';
import type { DerivedArticle } from 'types/Article';
import type { CardSets } from 'types/Collection';
import {
	createSelectCardsInCollection,
	createSelectArticleFromCard,
} from 'selectors/shared';
import pandaFetch from 'services/pandaFetch';
import { isValidURL } from 'util/url';

const totalPeriodInHours = 1;
const intervalInMinutes = 10;

export const PAGE_VIEW_DATA_RECEIVED = 'PAGE_VIEW_DATA_RECEIVED';
export const PAGE_VIEW_DATA_REQUESTED = 'PAGE_VIEW_DATA_REQUESTED';

const selectArticlesInCollection = createSelectCardsInCollection();
const selectArticleFromCard = createSelectArticleFromCard();

const getPageViewDataForCollection = (
	frontId: string,
	collectionId: string,
	collectionSet: CardSets,
): ThunkResult<void> => {
	return async (dispatch, getState) => {
		dispatch(pageViewDataRequestedAction(frontId));
		try {
			const state = getState();
			const articleIds: string[] = selectArticlesInCollection(state, {
				collectionId,
				collectionSet,
			});
			dispatch(getPageViewData(frontId, collectionId, articleIds));
		} catch (e) {
			throw new Error(`API request to Ophan for page view data failed: ${e}`);
		}
	};
};

const getPageViewData =
	(
		frontId: string,
		collectionId: string,
		articleIds: string[],
	): ThunkResult<void> =>
	async (dispatch, getState) => {
		const state = getState();
		const articles = articleIds
			.map((_) => selectArticleFromCard(state, _))
			.filter((_) => _) as DerivedArticle[];
		const urlPaths: string[] = articles
			.map(
				(article) =>
					article.urlPath
						? article.urlPath // it's an article
						: article.href &&
							!isValidURL(article.href) &&
							article.href.substr(1), // it's a snaplink
			)
			.filter((_) => _) as string[];
		const data = await fetchPageViewData(frontId, urlPaths);
		const dataWithArticleIds = convertToStoriesData(data, articles);
		dispatch(
			pageViewDataReceivedAction(dataWithArticleIds, frontId, collectionId),
		);
	};

const convertToStoriesData = (
	allStories: PageViewDataFromOphan[],
	articles: DerivedArticle[],
): PageViewStory[] =>
	allStories.reduce((acc, story) => {
		const articleId = getArticleIdFromOphanData(story, articles);
		return articleId
			? acc.concat({
					articleId,
					articlePath: story.path,
					totalHits: story.totalHits,
					data:
						story.series.length > 0 && story.series[0].data
							? story.series[0].data
							: [],
				})
			: acc;
	}, [] as PageViewStory[]);

const getArticleIdFromOphanData = (
	ophanData: PageViewDataFromOphan,
	articles: DerivedArticle[],
): string | undefined => {
	// if we have a urlPath, we need to trim the Ophan data path to make the comparison
	// if we have an href - because the article is a snap link - we don't need to trim
	const matchingArticle = articles.find(
		(a) => a.urlPath === ophanData.path.substr(1) || a.href === ophanData.path,
	);
	return matchingArticle ? matchingArticle.uuid : undefined;
};

const pageViewDataReceivedAction = (
	data: PageViewStory[],
	frontId: string,
	collectionId: string,
	// Clear out the previous data for this collection. Useful when polling
	// to prevent an endless accumulation of page view data.
	clearPreviousData = false,
): PageViewDataReceived => {
	return {
		type: PAGE_VIEW_DATA_RECEIVED,
		payload: {
			data,
			frontId,
			collectionId,
			clearPreviousData,
		},
	};
};

const pageViewDataRequestedAction = (
	frontId: string,
): PageViewDataRequested => {
	return {
		type: PAGE_VIEW_DATA_REQUESTED,
		payload: {
			frontId,
		},
	};
};

const fetchPageViewData = async (
	frontId: string,
	articlesInFront: string[],
): Promise<PageViewDataFromOphan[]> => {
	const base = 'https://fronts.local.dev-gutools.co.uk';
	const referringPath = `/ophan/histogram?referring-path=/${frontId}&`;
	const timePeriod = `hours=${totalPeriodInHours}&interval=${intervalInMinutes}`;
	const maxLength = 2048 - timePeriod.length - base.length;

	const articlePaths = articlesInFront.map((article) => `path=/${article}&`);

	const urls: string[] = articlePaths.reduce((acc, path) => {
		const latestUrl = acc[acc.length - 1];
		if (acc.length && latestUrl.length + path.length < maxLength) {
			acc.splice(acc.length - 1, 1, latestUrl + path);
			return acc;
		}
		return acc.concat(referringPath + path);
	}, [] as string[]);

	const ophanCalls = urls.map((url) =>
		pandaFetch(`${url}${timePeriod}`, {
			method: 'get',
			credentials: 'same-origin',
		}),
	);

	const response = await Promise.all(ophanCalls);
	const parsedResponse = await Promise.all(response.map((r) => r.json()));

	return ([] as PageViewDataFromOphan[]).concat(...parsedResponse);
};

export {
	fetchPageViewData,
	getPageViewData,
	getPageViewDataForCollection,
	pageViewDataReceivedAction,
};
