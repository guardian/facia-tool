import { PosSpec } from 'lib/dnd';
import type { State } from 'types/State';
import { selectGroupSiblings } from 'selectors/shared';
import { Group } from 'types/Collection';
import findIndex from 'lodash/findIndex';

function getFromGroupIndicesWithRespectToState(
	position: PosSpec | null,
	state: State,
): { fromWithRespectToState: PosSpec | null; fromOrphanedGroup: boolean } {
	if (!position) {
		return { fromWithRespectToState: null, fromOrphanedGroup: false };
	}

	if (position.type !== 'group') {
		return { fromWithRespectToState: position, fromOrphanedGroup: false };
	}
	const { articleCount, groupSiblings } = getGroupIndicesWithRespectToState(
		position,
		state,
	);

	// We allow dragging from orphaned groups but we need to do extra work
	// to figure out the current group and index of these articles
	if (position.index < articleCount) {
		const getGroupSiblingAndIndex = (
			siblingIndex: number,
			remainingGroupSiblings: Group[],
		): { groupId: string; index: number } => {
			const currentGroup = remainingGroupSiblings[0];
			if (siblingIndex < currentGroup.cards.length) {
				return { index: siblingIndex, groupId: currentGroup.uuid };
			}
			return getGroupSiblingAndIndex(
				siblingIndex - currentGroup.cards.length,
				remainingGroupSiblings.slice(1),
			);
		};

		const { groupId, index } = getGroupSiblingAndIndex(
			position.index,
			groupSiblings,
		);

		return {
			fromWithRespectToState: { ...position, ...{ index, id: groupId } },
			fromOrphanedGroup: true,
		};
	}

	const adjustedIndex = position.index - articleCount;
	return {
		fromWithRespectToState: { ...position, ...{ index: adjustedIndex } },
		fromOrphanedGroup: false,
	};
}

function getToGroupIndicesWithRespectToState(
	position: PosSpec,
	state: State,
	fromOrphanedGroup: boolean,
): PosSpec | null {
	if (position.type !== 'group') {
		return position;
	}
	const { articleCount } = getGroupIndicesWithRespectToState(position, state);
	const adjustedArticleCount = fromOrphanedGroup
		? articleCount - 1
		: articleCount;

	// We don`t allow dragging to orphaned group positions because it would
	// be unclear which group these articles should end up in
	if (position.index < adjustedArticleCount) {
		return null;
	}
	const adjustedIndex = position.index - adjustedArticleCount;
	return { ...position, ...{ index: adjustedIndex } };
}

const isOrphanedGroup = (group: Group) =>
	!group.name && group.id && group.id !== '0';

function getGroupIndicesWithRespectToState(
	position: PosSpec,
	state: State,
): { articleCount: number; groupSiblings: Group[] } {
	const groupId = position.id;
	const groupSiblings = selectGroupSiblings(state, groupId);
	const currentGroupIndex = findIndex(
		groupSiblings,
		(group) => group.uuid === groupId,
	);
	const groupAbove = groupSiblings[currentGroupIndex - 1];
	if (groupAbove && !isOrphanedGroup(groupAbove)) {
		return { groupSiblings, articleCount: 0 };
	}
	const articleCount = groupSiblings.reduce(
		(orphanedArticleCount: number, group) => {
			if (isOrphanedGroup(group)) {
				orphanedArticleCount += group.cards.length;
			}
			return orphanedArticleCount;
		},
		0,
	);

	return { groupSiblings, articleCount };
}

export {
	getToGroupIndicesWithRespectToState,
	getFromGroupIndicesWithRespectToState,
};
