import { PAGE_VIEW_DATA_RECEIVED } from './actions';
import { Action } from 'types/Action';
import {
  PageViewDataPerFront,
  PageViewDataPerCollection
} from 'shared/types/PageViewData';

type State = PageViewDataPerFront[];

const reducer = (state: State = [], action: Action): State => {
  switch (action.type) {
    case PAGE_VIEW_DATA_RECEIVED: {
      const frontsNotBeingChanged: PageViewDataPerFront[] = state.filter(
        front => front.frontId !== action.payload.frontId
      );
      const frontBeingChanged: PageViewDataPerFront | undefined = state.find(
        front => front.frontId === action.payload.frontId
      );
      const getCollectionsNotBeingChanged = (
        front: PageViewDataPerFront
      ): PageViewDataPerCollection[] | [] => {
        return front.collections.filter(
          collection => collection.collectionId !== action.payload.collectionId
        );
      };

      const collectionBeingChanged = {
        collectionId: action.payload.collectionId,
        stories: action.payload.data
      }

      const frontToBeChanged = (): PageViewDataPerFront => {
        if (frontBeingChanged) {
          // if front exists in state, remove the old version and create new one
          return {
            frontId: action.payload.frontId,
            collections: [
              ...getCollectionsNotBeingChanged(frontBeingChanged),
              collectionBeingChanged
            ]
          };
        }
        // if data for the front does not exist, create it
        return {
          frontId: action.payload.frontId,
          collections: [
            collectionBeingChanged
          ]
        }
      };

      return [...frontsNotBeingChanged, frontToBeChanged()];
    }
    default: {
      return state;
    }
  }
};

export { reducer };
