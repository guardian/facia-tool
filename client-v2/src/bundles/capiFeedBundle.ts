import createAsyncResourceBundle, { State } from 'lib/createAsyncResourceBundle';
import { CapiArticle } from 'types/Capi';

type FeedState = CapiArticle[];

export const {
  actions,
  actionNames,
  reducer,
  selectors,
  initialState
} = createAsyncResourceBundle<FeedState>('frontsConfig', {
  indexById: false,
  selectLocalState: state => state.capiFeed,
  initialData: {
    live: [],
    draft: []
  }
});

export type FrontsConfigState = State<FeedState>;
