// @flow

import type { Action } from 'types/Action';

function errorReceivingCollectionArticles(error: string): Action {
  return {
    type: 'CAUGHT_ERROR',
    message: 'Could not fetch collection articles from capi',
    error,
    receivedAt: Date.now()
  };
}

export { errorReceivingCollectionArticles };
