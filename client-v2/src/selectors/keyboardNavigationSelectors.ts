import {
  selectSharedState,
  indexInGroupSelector,
  groupsSelector,
  groupCollectionSelector,
  createCollectionSelector
} from '../shared/selectors/shared';
import { clipboardContentSelector } from 'selectors/clipboardSelectors';
import { State } from 'types/State';
import { getFrontCollections } from './frontsSelectors';

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
  action: 'up' | 'down',
  frontId: string
) => {
  const sharedState = selectSharedState(state);
  const group = groupsSelector(sharedState)[groupId];
  if (!group) {
    return null;
  }

  const groupArticleFragments = group.articleFragments;

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
    if (currentArticleIndex && currentArticleIndex !== 0) {
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

    if (frontId) {
      const frontCollections = getFrontCollections(state, frontId);
      const collectionIndex = frontCollections.indexOf(collection.id);

      if (action === 'down') {
        if (collectionIndex < frontCollections.length - 1) {
          const collectionSelector = createCollectionSelector();
          const coll = collectionSelector(sharedState, {
            collectionId: frontCollections[collectionIndex + 1]
          });

          if (!coll || !coll.draft) { return null; }

          const nextGroupId = coll.draft[0];
          return { toIndex: 0, nextGroupId };
        }
      }
      if (action === 'up') {
        if (collectionIndex !== 0) {
          const collectionSelector = createCollectionSelector();
          const coll = collectionSelector(sharedState, {
            collectionId: frontCollections[collectionIndex - 1]
          });

          if (!coll || !coll.draft) { return null; }

          const nextIndex = coll.draft.length - 1;
          const nextGroupId = coll.draft[nextIndex];

          return { toIndex: nextIndex, nextGroupId };
        }
      }
    }
  }

  // Move to the next collection: TODO
  // Else there is nowhere we can move

  return null;
};

export { nextIndexAndGroupSelector, nextClipboardIndexSelector };
