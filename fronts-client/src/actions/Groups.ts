import { Group } from 'types/Collection';

function groupsReceived(groups: { [id: string]: Group }) {
	return {
		type: 'SHARED/GROUPS_RECEIVED' as const,
		payload: groups,
	};
}

type GroupsReceived = ReturnType<typeof groupsReceived>;

const capGroupSiblings = (id: string, collectionCap: number) => ({
	type: 'SHARED/CAP_GROUP_SIBLINGS' as const,
	payload: {
		id,
		collectionCap,
	},
});

type CapGroupSiblings = ReturnType<typeof capGroupSiblings>;

export type GroupActions = GroupsReceived | CapGroupSiblings;

export { groupsReceived, capGroupSiblings };
