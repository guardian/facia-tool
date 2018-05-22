// @flow

import type { Action } from 'types/Action';

function errorReceivingArticles(error: string): Action {
  return {
    type: 'CAUGHT_ERROR',
    message: 'Could not fetch articles from Capi',
    error,
    receivedAt: Date.now()
  };
}

export { errorReceivingArticles };
