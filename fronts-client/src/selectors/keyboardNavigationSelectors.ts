import {
	selectIndexInGroup,
	selectGroupMap,
	selectGroupCollection,
	createSelectCollection,
} from './shared';
import { selectClipboardContent } from 'selectors/clipboardSelectors';
import type { State } from 'types/State';
import { selectUnlockedFrontCollections } from './frontsSelectors';

const selectNextClipboardIndex = (
	state: State,
	articleId: string,
	action: string,
) => {
	const clipboardContent = selectClipboardContent(state);

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

const selectNextIndexAndGroup = (
	state: State,
	groupId: string,
	articleId: string,
	action: 'up' | 'down',
	frontId: string,
) => {
	const group = selectGroupMap(state)[groupId];
	if (!group) {
		return null;
	}

	const groupCards = group.cards;

	const currentArticleIndex = selectIndexInGroup(state, groupId, articleId);

	// Checking if moving inside the group
	if (action === 'down') {
		// If the card is not the last in the group, the article stays in the group
		if (currentArticleIndex < groupCards.length - 1) {
			return { toIndex: currentArticleIndex + 1, nextGroupId: groupId };
		}
	}

	if (action === 'up') {
		// If article is not the first item in the group it can stay in the group
		if (currentArticleIndex && currentArticleIndex !== 0) {
			return { toIndex: currentArticleIndex - 1, nextGroupId: groupId };
		}
	}

	// Checking if moving between groups but inside the collection
	const { collection, cardSet } = selectGroupCollection(state, groupId);
	if (collection) {
		const collectionGroups = collection[cardSet];

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
					const nextGroupArticles = selectGroupMap(state)[nextGroupId].cards;
					return { toIndex: nextGroupArticles.length, nextGroupId };
				}
			}
		}

		// Checking if moving between collections
		const frontCollections = selectUnlockedFrontCollections(state, frontId);
		const collectionIndex = frontCollections.indexOf(collection.id);
		if (action === 'down') {
			if (collectionIndex < frontCollections.length - 1) {
				const selectCollection = createSelectCollection();
				const coll = selectCollection(state, {
					collectionId: frontCollections[collectionIndex + 1],
				});
				if (!coll || !coll.draft) {
					return null;
				}

				const nextGroupId = coll.draft[0];
				return { toIndex: 0, nextGroupId, collectionId: coll.id };
			}
		}
		if (action === 'up') {
			if (collectionIndex !== 0) {
				const selectCollection = createSelectCollection();
				const coll = selectCollection(state, {
					collectionId: frontCollections[collectionIndex - 1],
				});

				if (!coll || !coll.draft) {
					return null;
				}

				const nextIndex = coll.draft.length;
				const nextGroupId = coll.draft[nextIndex - 1];

				const nextGroupArticles = selectGroupMap(state)[nextGroupId].cards;

				return {
					toIndex: nextGroupArticles.length,
					nextGroupId,
					collectionId: coll.id,
				};
			}
		}
	}

	// If there is nowhere we can move we return null

	return null;
};

export {
	selectNextIndexAndGroup,
	selectNextClipboardIndex as selectNextClipboardIndexSelector,
};
