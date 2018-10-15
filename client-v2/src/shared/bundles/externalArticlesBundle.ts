import createAsyncResourceBundle from '../util/createAsyncResourceBundle';
import { ExternalArticle } from 'shared/types/ExternalArticle';

export const {
  actions,
  actionNames,
  reducer,
  selectors
} = createAsyncResourceBundle<ExternalArticle>('externalArticles', {
  indexById: true
});
