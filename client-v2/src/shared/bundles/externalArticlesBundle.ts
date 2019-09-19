import isAfter from 'date-fns/is_after';
import isValid from 'date-fns/is_valid';
import createAsyncResourceBundle from 'lib/createAsyncResourceBundle';
import { ExternalArticle } from 'shared/types/ExternalArticle';
import { State } from 'shared/reducers/sharedReducer';

export const {
  actions,
  actionNames,
  reducer,
  selectors,
  initialState
} = createAsyncResourceBundle<ExternalArticle>('externalArticles', {
  indexById: true
});

/**
 * Is the external article last modified field older than the given date?
 * This function is liberal in what it accepts -- if either date is invalid/missing, it returns `true`.
 */
export const selectIsExternalArticleStale = (
  state: State,
  id: string,
  dateStr: string | undefined
) => {
  const article = selectors.selectById(state, id);
  if (!article || !article.fields.lastModified || !dateStr) {
    return true;
  }
  const articleDate = new Date(article.fields.lastModified);
  const incomingDate = new Date(dateStr);
  if (!isValid(articleDate) || !isValid(incomingDate)) {
    return true;
  }
  return isAfter(incomingDate, articleDate);
};
