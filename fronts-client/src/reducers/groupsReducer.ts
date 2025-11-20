import { insertAndDedupeSiblings } from 'util/insertAndDedupeSiblings';
import type { Action } from 'types/Action';
import type { State } from 'types/State';
import { selectCardMap, selectGroupSiblings } from 'selectors/shared';
import { capGroupCards } from 'util/capGroupCards';
import keyBy from 'lodash/keyBy';

const getUpdatedSiblingGroupsForInsertion = (
	sharedState: State,
	groupsState: State['groups'],
	insertionGroupId: string,
	insertionIndex: number,
	cardId: string,
) => {
	const cardsMap = selectCardMap(sharedState);
	const groupSiblings = selectGroupSiblings(sharedState, insertionGroupId);

	if (!cardsMap[cardId]) {
		// this may have happened if we've purged after a poll
		return groupsState;
	}

	return groupSiblings.reduce(
		(acc, sibling) => ({
			...acc,
			[sibling.uuid]: {
				...sibling,
				cards: insertAndDedupeSiblings(
					sibling.cards || [],
					[cardId],
					insertionIndex,
					cardsMap,
					sibling.uuid === insertionGroupId, // this means no insertions happen here if it's not this group
				),
			},
		}),
		{} as State['groups'],
	);
};

const groups = (
	state: State['groups'] = {},
	action: Action,
	prevSharedState: State,
) => {
	switch (action.type) {
		case 'SHARED/GROUPS_RECEIVED': {
			const { payload } = action;
			return {
				...state,
				...payload,
			};
		}
		case 'REMOVE_GROUP_CARD': {
			const { id, cardId } = action.payload;
			const group = state[id];
			return {
				...state,
				[id]: {
					...group,
					cards: (group.cards || []).filter((afId) => afId !== cardId),
				},
			};
		}
		case 'INSERT_GROUP_CARD': {
			const { id, index, cardId } = action.payload;
			return {
				...state,
				...getUpdatedSiblingGroupsForInsertion(
					prevSharedState,
					state,
					id,
					index,
					cardId,
				),
			};
		}
		case 'SHARED/CAP_GROUP_SIBLINGS': {
			const { id, collectionCap } = action.payload;
			const groupSiblings = selectGroupSiblings(prevSharedState, id);
			const cappedSiblings = keyBy(
				capGroupCards(groupSiblings, collectionCap),
				({ uuid }) => uuid,
			);

			return {
				...state,
				...cappedSiblings,
			};
		}
		default: {
			return state;
		}
	}
};

export { getUpdatedSiblingGroupsForInsertion };

export default groups;
