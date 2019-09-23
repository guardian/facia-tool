import { ThunkResult } from 'types/Store';
import {
  PageViewDataRequested,
  PageViewDataReceived
} from '../../../shared/types/Action';
import {
  PageViewDataFromOphan,
  PageViewStory
} from 'shared/types/PageViewData';
import { DerivedArticle } from 'shared/types/Article';
import {
  createSelectArticlesInCollection,
  selectSharedState,
  createSelectArticleFromArticleFragment
} from 'shared/selectors/shared';
import { CollectionItemSets } from 'shared/types/Collection';
import pandaFetch from 'services/pandaFetch';

const totalPeriodInHours = 1;
const intervalInMinutes = 10;

export const PAGE_VIEW_DATA_RECEIVED = 'PAGE_VIEW_DATA_RECEIVED';
export const PAGE_VIEW_DATA_REQUESTED = 'PAGE_VIEW_DATA_REQUESTED';

const selectArticlesInCollection = createSelectArticlesInCollection();
const selectArticleFromArticleFragment = createSelectArticleFromArticleFragment();

const getPageViewData = (
  frontId: string,
  collectionId: string,
  collectionSet: CollectionItemSets
): ThunkResult<void> => {
  return async (dispatch, getState) => {
    dispatch(pageViewDataRequestedAction(frontId));
    try {
      const state = selectSharedState(getState());
      const articleIds: string[] = selectArticlesInCollection(state, {
        collectionId,
        collectionSet
      });
      const articles = articleIds
        .map(_ => selectArticleFromArticleFragment(state, _))
        .filter(_ => _) as DerivedArticle[];
      const urlPaths: string[] = articles
        .map(article => article.urlPath)
        .filter(_ => _) as string[];
      const data = await fetchPageViewData(frontId, urlPaths);
      const dataWithArticleIds = convertToStoriesData(data, articles);
      dispatch(
        pageViewDataReceivedAction(dataWithArticleIds, frontId, collectionId)
      );
    } catch (e) {
      throw new Error(`API request to Ophan for page view data failed: ${e}`);
    }
  };
};

const convertToStoriesData = (
  allStories: PageViewDataFromOphan[],
  articles: DerivedArticle[]
): PageViewStory[] =>
  allStories.reduce(
    (acc, story) => {
      const articleId = getArticleIdFromOphanData(story, articles);
      return articleId
        ? acc.concat({
            articleId,
            articlePath: story.path,
            totalHits: story.totalHits,
            data:
              story.series.length > 0 && story.series[0].data
                ? story.series[0].data
                : []
          })
        : acc;
    },
    [] as PageViewStory[]
  );

const getArticleIdFromOphanData = (
  ophanData: PageViewDataFromOphan,
  articles: DerivedArticle[]
): string | undefined => {
  // the path from ophan has a slash at the front, removing below
  const ophanPathClean = ophanData.path.substr(1);
  const matchingArticle = articles.find(a => a.urlPath === ophanPathClean);
  return matchingArticle ? matchingArticle.uuid : undefined;
};

const pageViewDataReceivedAction = (
  data: PageViewStory[],
  frontId: string,
  collectionId: string
): PageViewDataReceived => {
  return {
    type: PAGE_VIEW_DATA_RECEIVED,
    payload: {
      data,
      frontId,
      collectionId
    }
  };
};

const pageViewDataRequestedAction = (
  frontId: string
): PageViewDataRequested => {
  return {
    type: PAGE_VIEW_DATA_REQUESTED,
    payload: {
      frontId
    }
  };
};

const fetchPageViewData = async (
  frontId: string,
  articlesInFront: string[]
): Promise<PageViewDataFromOphan[]> => {
  const base = 'https://fronts.local.dev-gutools.co.uk';
  const referringPath = `/ophan/histogram?referring-path=/${frontId}&`;
  const timePeriod = `hours=${totalPeriodInHours}&interval=${intervalInMinutes}`;
  const maxLength = 2048 - timePeriod.length - base.length;

  const articlePaths = articlesInFront.map(article => `path=/${article}&`);

  const urls: string[] = articlePaths.reduce(
    (acc, path) => {
      const latestUrl = acc[acc.length - 1];
      if (acc.length && latestUrl.length + path.length < maxLength) {
        acc.splice(acc.length - 1, 1, latestUrl + path);
        return acc;
      }
      return acc.concat(referringPath + path);
    },
    [] as string[]
  );

  const ophanCalls = urls.map(url =>
    pandaFetch(`${url}${timePeriod}`, {
      method: 'get',
      credentials: 'same-origin'
    })
  );

  const response = await Promise.all(ophanCalls);
  const parsedResponse = await Promise.all(response.map(r => r.json()));

  return ([] as PageViewDataFromOphan[]).concat(...parsedResponse);
};

export { fetchPageViewData, getPageViewData, pageViewDataReceivedAction };
