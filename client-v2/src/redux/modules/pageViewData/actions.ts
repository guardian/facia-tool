import { Dispatch, ThunkResult } from 'types/Store';
import {
  PageViewDataRequested,
  PageViewDataReceived
} from '../../../shared/types/Action';
import { getPageViewDataFromOphan } from '../../../services/faciaApi';
import {
  PageViewDataFromOphan,
  PageViewStory,
  ArticlePathAndId
} from 'shared/types/PageViewData';

const totalPeriodInHours = 1;
const intervalInMinutes = 10;

export const PAGE_VIEW_DATA_RECEIVED = 'PAGE_VIEW_DATA_RECEIVED';
export const PAGE_VIEW_DATA_REQUESTED = 'PAGE_VIEW_DATA_REQUESTED';

const getPageViewData = (
  frontId: string,
  articles: ArticlePathAndId[],
  collectionId: string
): ThunkResult<void> => {
  return (dispatch: Dispatch) => {
    dispatch(pageViewDataRequestedAction(frontId));
    try {
      fetchPageViewData(frontId, articles).then(result => {
        result.json().then((data: PageViewDataFromOphan[]) => {
          const dataWithArticleIds = convertToStoriesData(data, articles);
          dispatch(
            pageViewDataReceivedAction(
              dataWithArticleIds,
              frontId,
              collectionId
            )
          );
        });
      });
    } catch (e) {
      throw new Error(`API request to Ophan for page view data failed: ${e}`);
    }
  };
};

const convertToStoriesData = (
  allStories: PageViewDataFromOphan[],
  articles: ArticlePathAndId[]
): PageViewStory[] => {
  return allStories.map(story => {
    return {
      articleId: addArticleId(story, articles),
      articlePath: story.path,
      totalHits: story.totalHits,
      data:
        story.series.length > 0 && story.series[0].data
          ? story.series[0].data
          : []
    };
  });
};

const addArticleId = (
  ophanData: PageViewDataFromOphan,
  articles: ArticlePathAndId[]
): string => {
  // the path from ophan has a slash at the front, removing below
  const ophanPathClean = ophanData.path.substr(1);
  const matchingArticle = articles.find(a => a.articlePath === ophanPathClean)!;
  return matchingArticle.articleId;
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
  articlesInFront: ArticlePathAndId[]
): Promise<any> => {
  return getPageViewDataFromOphan(buildRequestUrl(front, articlesInFront));
};

const buildRequestUrl = (
  frontId: string,
  articles: ArticlePathAndId[]
): string => {
  const referringPath = `?referring-path=/${frontId}&`;
  const articlePaths = articles
    .map(article => `path=/${article.articlePath}&`)
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
