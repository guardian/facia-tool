// @flow

import type { Action } from 'types/Action';

function errorReceivingFrontCollection(error: string): Action {
  return {
    type: 'CAUGHT_ERROR',
    message: 'Could not fetch collection',
    error,
    receivedAt: Date.now()
  };
}

export { errorReceivingFrontCollection };
