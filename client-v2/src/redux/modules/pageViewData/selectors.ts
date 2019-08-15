import { State } from '../../../types/State';
import {
  PageViewDataPerFront,
  PageViewDataPerCollection,
  PageViewStory,
  PageViewArticlesOnFront
} from 'shared/types/PageViewData';

const selectPageViewDataForArticleId = (
  state: State,
  articleId: string,
  frontId: string
): PageViewStory | undefined => {
  const dataForFront: PageViewDataPerFront | undefined = selectPageViewData(
    state
  ).find(front => front.frontId === frontId);

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

export {
  selectPageViewData,
  selectPageViewDataForArticleId,
  selectOpenCollectionsForFront
};
