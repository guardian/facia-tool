

import createAsyncResourceBundle, { State } from 'shared/util/createAsyncResourceBundle';
import { State as RootState } from 'types/State';
import { FrontsConfig } from 'types/FaciaApi';

export const {
  actions,
  actionNames,
  reducer,
  selectors,
  initialState
} = createAsyncResourceBundle<FrontsConfig, RootState>('frontsConfig', {
  indexById: false,
  selectLocalState: (state: RootState) => state.fronts.frontsConfig,
  initialData: {
    fronts: {},
    collections: {}
  }
});

export type FrontsConfigState = State<FrontsConfig>;
