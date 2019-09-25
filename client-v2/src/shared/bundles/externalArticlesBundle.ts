import createAsyncResourceBundle from 'lib/createAsyncResourceBundle';
import { ExternalArticle } from 'shared/types/ExternalArticle';

import { createSelectIsArticleStale } from 'shared/util/externalArticle';

export const {
  actions,
  actionNames,
  reducer,
  selectors,
  initialState
} = createAsyncResourceBundle<ExternalArticle>('externalArticles', {
  indexById: true
});

export const selectIsExternalArticleStale = createSelectIsArticleStale(
  selectors.selectById
);
