

import createAsyncResourceBundle from '../util/createAsyncResourceBundle';

export const {
  actions,
  actionNames,
  reducer,
  selectors
} = createAsyncResourceBundle('externalArticles', { indexById: true });
