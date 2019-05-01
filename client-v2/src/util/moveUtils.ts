import { PosSpec } from 'lib/dnd';
import { State } from 'shared/types/State';
import { groupSiblingsSelector } from 'shared/selectors/shared';
import { Group } from 'shared/types/Collection';

function getFromGroupIndecesWithRespectToState(
  position: PosSpec | null,
  state: State
): { fromWithRespectToState: PosSpec | null; fromOrphanedGroup: boolean } {
  if (!position) {
    return { fromWithRespectToState: null, fromOrphanedGroup: false };
  }

  if (position.type === 'clipboard') {
    return { fromWithRespectToState: position, fromOrphanedGroup: false };
  }
  const { articleCount, groupSiblings } = getGroupIndecesWithRespectToState(
    position,
    state
  );

  // We allow dragging from orphaned groups but we need to do extra work
  // to figure out the current group and index of these articles
  if (position.index < articleCount) {
    const getGroupSiblingAndIndex = (
      siblingIndex: number,
      remainingGroupSiblings: Group[]
    ): { groupId: string; index: number } => {
      const currentGroup = remainingGroupSiblings[0];
      if (siblingIndex < currentGroup.articleFragments.length) {
        return { index: siblingIndex, groupId: currentGroup.uuid };
      }
      return getGroupSiblingAndIndex(
        siblingIndex - currentGroup.articleFragments.length,
        remainingGroupSiblings.slice(1)
      );
    };

    const { groupId, index } = getGroupSiblingAndIndex(
      position.index,
      groupSiblings
    );

    return {
      fromWithRespectToState: { ...position, ...{ index, id: groupId } },
      fromOrphanedGroup: true
    };
  }

  const adjustedIndex = position.index - articleCount;
  return {
    fromWithRespectToState: { ...position, ...{ index: adjustedIndex } },
    fromOrphanedGroup: false
  };
}

function getToGroupIndecesWithRespectToState(
  position: PosSpec,
  state: State,
  fromOrphanedGroup: boolean
): PosSpec | null {
  if (position.type === 'clipboard') {
    return position;
  }
  const { articleCount } = getGroupIndecesWithRespectToState(position, state);
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

function getGroupIndecesWithRespectToState(
  position: PosSpec,
  state: State
): { articleCount: number; groupSiblings: Group[] } {
  const groupId = position.id;
  const groupSiblings = groupSiblingsSelector(state, groupId);
  const articleCount = groupSiblings.reduce(
    (orphanedArticleCount: number, group) => {
      if (!group.name && group.id && group.id !== '0') {
        orphanedArticleCount += group.articleFragments.length;
      }
      return orphanedArticleCount;
    },
    0
  );

  return { groupSiblings, articleCount };
}

export {
  getToGroupIndecesWithRespectToState,
  getFromGroupIndecesWithRespectToState
};
