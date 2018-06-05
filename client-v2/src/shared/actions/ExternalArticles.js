// @flow

import { type $ReturnType } from '../types/Utility';
import createAsyncResourceBundle from '../util/createAsyncResourceBundle';

export const { actions, selectors, reducer } = createAsyncResourceBundle(
  'ExternalArticle'
);

export type Actions =
  | $ReturnType<typeof actions.fetchStart>
  | $ReturnType<typeof actions.fetchSuccess>
  | $ReturnType<typeof actions.fetchError>;
