import { ThunkResult } from 'types/Store';
import {
  PageViewDataRequested,
  PageViewDataReceived
} from '../../../shared/types/Action';
import { getPageViewDataFromOphan } from '../../../services/faciaApi';
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
      const articleIds = selectArticlesInCollection(state, {
        collectionId,
        collectionSet
      });
      const articles = articleIds
        .map(_ => selectArticleFromArticleFragment(state, _))
        .filter(_ => _) as DerivedArticle[];
      const result = await fetchPageViewData(frontId, articles);
      result.json().then((data: PageViewDataFromOphan[]) => {
        const dataWithArticleIds = convertToStoriesData(data, articles);
        dispatch(
          pageViewDataReceivedAction(dataWithArticleIds, frontId, collectionId)
        );
      });
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

const fetchPageViewData = (
  front: string,
  articlesInFront: DerivedArticle[]
): Promise<any> => {
  return getPageViewDataFromOphan(buildRequestUrl(front, articlesInFront));
};

const buildRequestUrl = (
  frontId: string,
  articles: DerivedArticle[]
): string => {
  const referringPath = `?referring-path=/${frontId}&`;
  const articlePaths = articles
    .map(article => `path=/${article.urlPath}&`)
    .join('');
  const timePeriod = `hours=${totalPeriodInHours}&interval=${intervalInMinutes}`;
  return `${referringPath}${articlePaths}${timePeriod}`;
};

export {
  fetchPageViewData,
  buildRequestUrl,
  getPageViewData,
  pageViewDataReceivedAction
};
