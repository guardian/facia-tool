import {
  selectSharedState,
  indexInGroupSelector,
  groupsSelector,
  groupCollectionSelector
} from '../shared/selectors/shared';
import { clipboardContentSelector } from 'selectors/clipboardSelectors';
import { State } from 'types/State';

const nextClipboardIndexSelector = (
  state: State,
  articleId: string,
  action: string
) => {
  const clipboardContent = clipboardContentSelector(state);

  const fromIndex = clipboardContent.indexOf(articleId);

  if (action === 'down') {
    if (fromIndex < clipboardContent.length - 1) {
      return { fromIndex, toIndex: fromIndex + 1 };
    }
  }
  if (action === 'up') {
    if (fromIndex > 0) {
      return { fromIndex, toIndex: fromIndex - 1 };
    }
  }
  return null;
};

const nextIndexAndGroupSelector = (
  state: State,
  groupId: string,
  articleId: string,
  action: 'up' | 'down'
) => {
  const sharedState = selectSharedState(state);
  const groupArticleFragments = groupsSelector(sharedState)[groupId]
    .articleFragments;

  const currentArticleIndex = indexInGroupSelector(
    sharedState,
    groupId,
    articleId
  );
  if (action === 'down') {
    // If the article fragment is not the last in the group, the article stays in the group
    if (currentArticleIndex < groupArticleFragments.length - 1) {
      return { toIndex: currentArticleIndex + 1, nextGroupId: groupId };
    }
  }

  if (action === 'up') {
    // If article is not the first item in the group it can stay in the group
    if (currentArticleIndex !== 0) {
      return { toIndex: currentArticleIndex - 1, nextGroupId: groupId };
    }
  }

  // If the article can't stay in the same group we check if there is another group it can move to
  const { collection, collectionItemSet } = groupCollectionSelector(
    sharedState,
    groupId
  );
  if (collection) {
    const collectionGroups = collection[collectionItemSet];

    if (collectionGroups) {
      const groupIndex = collectionGroups.indexOf(groupId);

      if (action === 'down') {
        if (groupIndex < collectionGroups.length - 1) {
          return { toIndex: 0, nextGroupId: collectionGroups[groupIndex + 1] };
        }
      }

      if (action === 'up') {
        if (groupIndex !== 0) {
          const nextGroupId = collectionGroups[groupIndex - 1];
          const nextGroupArticles = groupsSelector(sharedState)[nextGroupId]
            .articleFragments;
          return { toIndex: nextGroupArticles.length, nextGroupId };
        }
      }
    }
  }

  // Move to the next collection: TODO
  // Else there is nowhere we can move
  return null;
};

export { nextIndexAndGroupSelector, nextClipboardIndexSelector };
