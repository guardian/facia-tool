import { oc } from 'ts-optchain';
import { State } from '../../../types/State';
import { PageViewStory } from 'shared/types/PageViewData';

const selectPageViewData = (state: State) => state.shared.pageViewData;

const selectOpenCollectionsForFront = (
  allCollectionsInAFront: string[],
  openCollectionIds: string[]
): string[] => {
  return allCollectionsInAFront.filter(collection =>
    openCollectionIds.includes(collection)
  );
};

const selectDataForArticle = (
  state: State,
  frontId: string,
  collectionId: string,
  articleId: string
): PageViewStory | undefined =>
  oc(state).shared.pageViewData[frontId].collections[collectionId].stories[
    articleId
  ]();

export {
  selectPageViewData,
  selectOpenCollectionsForFront,
  selectDataForArticle
};
