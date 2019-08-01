import { PAGE_VIEW_DATA_RECEIVED } from 'actions/PageViewData';
import { Action } from 'types/Action';
import { PageViewDataPerFront } from 'shared/types/PageViewData';

type State = PageViewDataPerFront;
const initialState: PageViewDataPerFront = { frontId: '', collections: [] };

const reducer = (state: State = initialState, action: Action): State => {
  switch (action.type) {
    case PAGE_VIEW_DATA_RECEIVED: {
      return {
        frontId: action.payload.frontId,
        collections: [
          ...state.collections,
          {
            collectionId: action.payload.collectionId,
            stories: action.payload.data
          }
        ]
      };
    }
    default: {
      return state;
    }
  }
};

export { reducer };
