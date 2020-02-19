import { Group } from 'shared/types/Collection';
import { CapGroupSiblings } from 'shared/types/Action';

function groupsReceived(groups: { [id: string]: Group }) {
  return {
    type: 'SHARED/GROUPS_RECEIVED' as 'SHARED/GROUPS_RECEIVED',
    payload: groups
  };
}

const capGroupSiblings = (
  id: string,
  collectionCap: number
): CapGroupSiblings => ({
  type: 'SHARED/CAP_GROUP_SIBLINGS',
  payload: {
    id,
    collectionCap
  }
});

export { groupsReceived, capGroupSiblings };
