

import createAsyncResourceBundle from 'shared/util/createAsyncResourceBundle';
import type { State } from 'types/State';

export const {
  actions,
  actionNames,
  reducer,
  selectors,
  initialState
} = createAsyncResourceBundle('frontsConfig', {
  indexById: false,
  selectLocalState: (state: State) => state.fronts.frontsConfig,
  initialData: {
    fronts: {},
    collections: {}
  }
});
