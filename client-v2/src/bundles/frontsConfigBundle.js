// @flow

import createAsyncResourceBundle from 'shared/util/createAsyncResourceBundle';

export const {
  actions,
  actionNames,
  reducer,
  selectors
} = createAsyncResourceBundle('frontsConfig', { indexById: false });
