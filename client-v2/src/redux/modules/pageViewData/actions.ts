import { Dispatch, ThunkResult } from 'types/Store';
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

const totalPeriodInHours = 1;
const intervalInMinutes = 10;

export const PAGE_VIEW_DATA_RECEIVED = 'PAGE_VIEW_DATA_RECEIVED';
export const PAGE_VIEW_DATA_REQUESTED = 'PAGE_VIEW_DATA_REQUESTED';

const getPageViewData = (
  frontId: string,
  articles: DerivedArticle[],
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
  articles: DerivedArticle[]
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
  articles: DerivedArticle[]
): string => {
  // the path from ophan has a slash at the front, removing below
  const ophanPathClean = ophanData.path.substr(1);
  const matchingArticle = articles.find(a => a.urlPath === ophanPathClean)!;
  return matchingArticle.id;
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
