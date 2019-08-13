import { State } from '../../../types/State';
import {
  PageViewDataPerFront,
  PageViewDataPerCollection
} from 'shared/types/PageViewData';

const selectPageViewDataForArticlePath = (state: State, url: string) =>
  selectPageViewData(state);

const selectPageViewData = (state: State): PageViewDataPerFront[] =>
  state.shared.pageViewData;

const selectPageViewDataForCollection = (
  state: State,
  collectionId: string,
  frontId: string
): PageViewDataPerCollection | undefined => {
  if (!state.shared.pageViewData) {
    return;
  }
  const possibleFront = state.shared.pageViewData.find(
    front => front.frontId === frontId
  );

  return (
    possibleFront &&
    possibleFront.collections &&
    possibleFront.collections.find(c => c.collectionId === collectionId)
  );
};

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
  selectPageViewDataForArticlePath,
  selectPageViewDataForCollection,
  selectOpenCollectionsForFront
};
