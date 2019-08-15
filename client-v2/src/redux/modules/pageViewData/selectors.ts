import { createSelector } from 'reselect';
import { State } from '../../../types/State';
import {
  PageViewDataPerFront,
  PageViewDataPerCollection,
  PageViewArticlesOnFront
} from 'shared/types/PageViewData';

const selectArticleId = (state: State, articleId: string, frontId: string) => {
  return articleId;
};

const selectFrontId = (state: State, articleId: string, frontId: string) => {
  return frontId;
};

const selectPageViewData = (state: State): PageViewDataPerFront[] =>
  state.shared.pageViewData;

const selectOpenCollectionsForFront = (
  allCollectionsInAFront: string[],
  openCollectionIds: string[]
): string[] => {
  return allCollectionsInAFront.filter(collection =>
    openCollectionIds.includes(collection)
  );
};

const createSelectDataForArticle = () =>
  createSelector(
    [selectPageViewData, selectArticleId, selectFrontId],
    (pageViewData, articleId, frontId) => {
      const dataForFront: PageViewDataPerFront | undefined = pageViewData.find(
        front => front.frontId === frontId
      );

      const allArticlesOnFront =
        dataForFront &&
        dataForFront.collections.reduce(
          (acc: PageViewArticlesOnFront, curr: PageViewDataPerCollection) => {
            return {
              frontId,
              stories: acc.stories.concat(curr.stories)
            } as PageViewArticlesOnFront;
          },
          { frontId, stories: [] }
        );

      return (
        allArticlesOnFront &&
        allArticlesOnFront.stories.find(article => {
          return article.articleId === articleId;
        })
      );
    }
  );

export {
  selectPageViewData,
  selectOpenCollectionsForFront,
  createSelectDataForArticle
};
