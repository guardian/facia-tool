import createAsyncResourceBundle, { State } from 'shared/util/createAsyncResourceBundle';
import { FrontsConfig } from 'types/FaciaApi';

export const {
  actions,
  actionNames,
  reducer,
  selectors,
  initialState
} = createAsyncResourceBundle<FrontsConfig>('frontsConfig', {
  indexById: false,
  selectLocalState: state => state.fronts.frontsConfig,
  initialData: {
    fronts: {},
    collections: {}
  }
});

export type FrontsConfigState = State<FrontsConfig>;
