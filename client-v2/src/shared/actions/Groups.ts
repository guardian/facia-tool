

import { Group } from 'shared/types/Collection';

function groupsReceived(groups: { [string]: Group }) {
  return {
    type: 'SHARED/GROUPS_RECEIVED',
    payload: groups
  };
}

export { groupsReceived };
