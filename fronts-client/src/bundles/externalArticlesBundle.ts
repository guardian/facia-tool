import { createIndexedAsyncResourceBundle } from 'lib/createAsyncResourceBundle';
import { ExternalArticle } from 'types/ExternalArticle';

import { createSelectIsArticleStale } from 'util/externalArticle';

export const { actions, actionNames, reducer, selectors, initialState } =
	createIndexedAsyncResourceBundle<ExternalArticle>('externalArticles', {});

export const selectIsExternalArticleStale = createSelectIsArticleStale(
	selectors.selectById,
);
