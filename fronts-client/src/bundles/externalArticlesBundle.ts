import createAsyncResourceBundle from 'lib/createAsyncResourceBundle';
import { ExternalArticle } from 'types/ExternalArticle';

import { createSelectIsArticleStale } from 'util/externalArticle';

export const { actions, actionNames, reducer, selectors, initialState } =
	createAsyncResourceBundle<ExternalArticle>('externalArticles', {
		indexById: true,
	});

export const selectIsExternalArticleStale = createSelectIsArticleStale(
	selectors.selectById,
);
