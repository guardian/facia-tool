import without from 'lodash/without';
import compact from 'lodash/compact';
import uniq from 'lodash/uniq';
import sortBy from 'lodash/sortBy';
import flatten from 'lodash/flatten';
import { createSelector } from 'reselect';

import type { Action } from 'types/Action';
import type {
	EditorOpenCurrentFrontsMenu,
	EditorCloseCurrentFrontsMenu,
	EditorCloseFront,
	EditorMoveFront,
	EditorClearOpenFronts,
	EditorSetOpenFronts,
	EditorAddFront,
	EditorFavouriteFront,
	EditorUnfavouriteFront,
	EditorSetFavouriteFronts,
	EditorSelectCard,
	EditorClearCardSelection,
	EditorOpenCollection,
	EditorCloseCollection,
	EditorOpenClipboard,
	EditorCloseClipboard,
	EditorOpenOverview,
	EditorCloseOverview,
	EditorOpenAllOverviews,
	EditorCloseAllOverviews,
	ChangedBrowsingStage,
} from 'types/Action';
import type { State as GlobalState } from 'types/State';

import { events } from 'services/GA';
import { selectFrontsWithPriority } from 'selectors/frontsSelectors';
import { REMOVE_GROUP_CARD, REMOVE_SUPPORTING_CARD } from 'actions/CardsCommon';
import { Stages } from 'types/Collection';
import { selectPriority } from 'selectors/pathSelectors';
import { CollectionWithArticles } from 'types/PageViewData';
import {
	createSelectCardsInCollection,
	createSelectArticleFromCard,
	selectFronts,
} from 'selectors/shared';

export const EDITOR_OPEN_CURRENT_FRONTS_MENU =
	'EDITOR_OPEN_CURRENT_FRONTS_MENU';
export const EDITOR_CLOSE_CURRENT_FRONTS_MENU =
	'EDITOR_CLOSE_CURRENT_FRONTS_MENU';
export const EDITOR_OPEN_FRONT = 'EDITOR_OPEN_FRONT';
export const EDITOR_MOVE_FRONT = 'EDITOR_MOVE_FRONT';
export const EDITOR_CLOSE_FRONT = 'EDITOR_CLOSE_FRONT';
export const EDITOR_FAVOURITE_FRONT = 'EDITOR_FAVOURITE_FRONT';
export const EDITOR_UNFAVOURITE_FRONT = 'EDITOR_UNFAVOURITE_FRONT';
export const EDITOR_SET_FAVE_FRONTS = 'EDITOR_SET_FAVE_FRONTS';
export const EDITOR_CLEAR_OPEN_FRONTS = 'EDITOR_CLEAR_OPEN_FRONTS';
export const EDITOR_SET_OPEN_FRONTS = 'EDITOR_SET_OPEN_FRONTS';
export const EDITOR_OPEN_COLLECTION = 'EDITOR_OPEN_COLLECTION';
export const EDITOR_CLOSE_COLLECTION = 'EDITOR_CLOSE_COLLECTION';
export const EDITOR_SELECT_CARD = 'EDITOR_SELECT_CARD';
export const EDITOR_CLEAR_CARD_SELECTION = 'EDITOR_CLEAR_CARD_SELECTION';
export const EDITOR_OPEN_CLIPBOARD = 'EDITOR_OPEN_CLIPBOARD';
export const EDITOR_CLOSE_CLIPBOARD = 'EDITOR_CLOSE_CLIPBOARD';
export const EDITOR_OPEN_OVERVIEW = 'EDITOR_OPEN_OVERVIEW';
export const EDITOR_CLOSE_OVERVIEW = 'EDITOR_CLOSE_OVERVIEW';
export const EDITOR_OPEN_ALL_OVERVIEWS = 'EDITOR_OPEN_ALL_OVERVIEWS';
export const EDITOR_CLOSE_ALL_OVERVIEWS = 'EDITOR_CLOSE_ALL_OVERVIEWS';
export const CHANGED_BROWSING_STAGE = 'CHANGED_BROWSING_STAGE';
export const EDITOR_CLOSE_FORMS_FOR_COLLECTION =
	'EDITOR_CLOSE_FORMS_FOR_COLLECTION' as const;

const editorOpenCollections = (
	collectionIds: string | string[],
): EditorOpenCollection => ({
	type: EDITOR_OPEN_COLLECTION,
	payload: { collectionIds },
});

const editorCloseCollections = (
	collectionIds: string | string[],
): EditorCloseCollection => ({
	type: EDITOR_CLOSE_COLLECTION,
	payload: { collectionIds },
});

const editorOpenCurrentFrontsMenu = (): EditorOpenCurrentFrontsMenu => ({
	type: EDITOR_OPEN_CURRENT_FRONTS_MENU,
});

const editorCloseCurrentFrontsMenu = (): EditorCloseCurrentFrontsMenu => ({
	type: EDITOR_CLOSE_CURRENT_FRONTS_MENU,
});

/**
 * !SIDE EFFECTS IN ACTION CREATOR
 * we could change these to thunks but the analytics calls are essentially
 * transparent and adding thunks makese the tests for these actions more
 * involved. On balance we're going for it ...
 */

const editorOpenFront = (frontId: string, priority: string): EditorAddFront => {
	events.addFront(frontId);
	return {
		type: EDITOR_OPEN_FRONT,
		payload: { frontId, priority },
		meta: {
			persistTo: 'openFrontIds',
		},
	};
};

const editorMoveFront = (frontId: string, toIndex: number): EditorMoveFront => {
	events.moveFront(frontId);
	return {
		type: 'EDITOR_MOVE_FRONT',
		payload: { frontId, toIndex },
		meta: {
			persistTo: 'openFrontIds',
		},
	};
};

const editorCloseFront = (frontId: string): EditorCloseFront => {
	events.removeFront(frontId);
	return {
		type: EDITOR_CLOSE_FRONT,
		payload: { frontId },
		meta: {
			persistTo: 'openFrontIds',
		},
	};
};

const changedBrowsingStage = (
	frontId: string,
	browsingStage: Stages,
): ChangedBrowsingStage => {
	return {
		type: CHANGED_BROWSING_STAGE,
		payload: {
			frontId,
			browsingStage,
		},
	};
};

const editorFavouriteFront = (
	frontId: string,
	priority: string,
): EditorFavouriteFront => {
	return {
		type: EDITOR_FAVOURITE_FRONT,
		payload: { frontId, priority },
		meta: {
			persistTo: 'favouriteFrontIds',
		},
	};
};

const editorUnfavouriteFront = (
	frontId: string,
	priority: string,
): EditorUnfavouriteFront => {
	return {
		type: EDITOR_UNFAVOURITE_FRONT,
		payload: { frontId, priority },
		meta: {
			persistTo: 'favouriteFrontIds',
		},
	};
};

const editorClearOpenFronts = (): EditorClearOpenFronts => ({
	type: EDITOR_CLEAR_OPEN_FRONTS,
	meta: {
		persistTo: 'openFrontIds',
	},
});

const editorSetOpenFronts = (frontIdsByPriority: {
	[id: string]: string[];
}): EditorSetOpenFronts => ({
	type: EDITOR_SET_OPEN_FRONTS,
	payload: {
		frontIdsByPriority,
	},
});

const editorSetFavouriteFronts = (favouriteFrontIdsByPriority: {
	[id: string]: string[];
}): EditorSetFavouriteFronts => ({
	type: EDITOR_SET_FAVE_FRONTS,
	payload: {
		favouriteFrontIdsByPriority,
	},
});

const editorSelectCard = (
	cardId: string,
	collectionId: string,
	frontId: string,
	isSupporting = false,
): EditorSelectCard => ({
	type: EDITOR_SELECT_CARD,
	payload: { cardId, frontId, collectionId, isSupporting },
});

const editorClearCardSelection = (
	cardId: string,
): EditorClearCardSelection => ({
	type: EDITOR_CLEAR_CARD_SELECTION,
	payload: { cardId },
});

const editorCloseFormsForCollection = (
	collectionId: string,
	frontId: string,
) => ({
	type: EDITOR_CLOSE_FORMS_FOR_COLLECTION,
	payload: { collectionId, frontId },
});

type EditorCloseFormsForCollection = ReturnType<
	typeof editorCloseFormsForCollection
>;

const editorOpenClipboard = (): EditorOpenClipboard => ({
	type: EDITOR_OPEN_CLIPBOARD,
});

const editorCloseClipboard = (): EditorCloseClipboard => ({
	type: EDITOR_CLOSE_CLIPBOARD,
});

const editorOpenOverview = (frontId: string): EditorOpenOverview => ({
	type: EDITOR_OPEN_OVERVIEW,
	payload: {
		frontId,
	},
});

const editorCloseOverview = (frontId: string): EditorCloseOverview => ({
	type: EDITOR_CLOSE_OVERVIEW,
	payload: {
		frontId,
	},
});

const editorOpenAllOverviews = (): EditorOpenAllOverviews => ({
	type: EDITOR_OPEN_ALL_OVERVIEWS,
});

const editorCloseAllOverviews = (): EditorCloseAllOverviews => ({
	type: EDITOR_CLOSE_ALL_OVERVIEWS,
});

interface OpenCardData {
	id: string;
	isSupporting: boolean;
	collectionId: string;
}

interface State {
	showOpenFrontsMenu: boolean;
	frontIds: string[];
	frontIdsByPriority: {
		[id: string]: string[];
	};
	favouriteFrontIdsByPriority: {
		[id: string]: string[];
	};
	collectionIds: string[];
	closedOverviews: string[];
	clipboardOpen: boolean;
	selectedCards: {
		[frontId: string]: OpenCardData[];
	};
	frontIdsByBrowsingStage: {
		[frontId: string]: Stages;
	};
}

const selectIsCurrentFrontsMenuOpen = (state: GlobalState) =>
	state.editor.showOpenFrontsMenu;

const selectIsCollectionOpen = <T extends { editor: State }>(
	state: T,
	collectionId: string,
) => state.editor.collectionIds.indexOf(collectionId) !== -1;

const selectOpenCollections = <T extends { editor: State }>(state: T) =>
	state.editor.collectionIds;

const selectIsClipboardOpen = <T extends { editor: State }>(state: T) =>
	state.editor.clipboardOpen;

const selectIsFrontOverviewOpen = <T extends { editor: State }>(
	state: T,
	frontId: string,
) => !state.editor.closedOverviews.includes(frontId);

const createSelectFrontIdWithOpenAndStarredStatesByPriority = () => {
	const selectEditorFrontsByPriority = createSelectEditorFrontsByPriority();
	return createSelector(
		selectFrontsWithPriority,
		selectEditorFrontsByPriority,
		(state: GlobalState, priority: string) =>
			selectEditorFavouriteFrontIdsByPriority(state, priority),
		(_: unknown, __: unknown, sortKey: 'id' | 'index' = 'id') => sortKey,
		(frontsForPriority, openFronts, favouriteFronts, sortKey) => {
			const fronts = frontsForPriority.map(({ id, displayName, index }) => ({
				id,
				displayName,
				index,
				isOpen: !!openFronts.find((_) => _.id === id),
				isStarred: !!favouriteFronts.includes(id),
			}));
			return sortBy(fronts, (front) => front[sortKey]);
		},
	);
};

function createSelectCollectionsInOpenFronts() {
	const selectEditorFrontsByPriority = createSelectEditorFrontsByPriority();
	return (state: GlobalState): string[] => {
		const openFrontsForPriority = selectEditorFrontsByPriority(state);
		return flatten(openFrontsForPriority.map((front) => front.collections));
	};
}

const createSelectCurrentlyOpenCollectionsByFront = () => {
	const selectEditorFrontsByPriority = createSelectEditorFrontsByPriority();
	return createSelector(
		selectEditorFrontsByPriority,
		selectOpenCollections,
		(openFronts, openCollectionIds) => {
			const openFrontsWithCollections = openFronts.map((front) => ({
				id: front.id,
				collections: front.collections,
			}));
			return openFrontsWithCollections.map((front) => {
				const collections = front.collections.filter((collection) =>
					openCollectionIds.includes(collection),
				);
				return {
					frontId: front.id,
					collections,
				};
			});
		},
	);
};

/**
 * Select the parent front of an card.
 * For performance reasons, only considers open fronts and collections.
 */
const selectOpenParentFrontOfCard = (
	state: GlobalState,
	cardId: string,
): [string, string] | [] => {
	const openFrontsCollectionsAndArticles =
		selectOpenFrontsCollectionsAndArticles(state);
	let frontId;
	let collectionId;

	// I've used an imperative loop for efficiency's sake here, as it lets us break.
	for (const front of openFrontsCollectionsAndArticles) {
		for (const collection of front.collections) {
			if (collection.articleIds.includes(cardId)) {
				frontId = front.frontId;
				collectionId = collection.id;
				break;
			}
		}
		if (frontId && collectionId) {
			break;
		}
	}
	return frontId && collectionId ? [frontId, collectionId] : [];
};

const selectOpenCardIds = (state: GlobalState): string[] => {
	const frontsCollectionsAndArticles =
		selectOpenFrontsCollectionsAndArticles(state);
	const collections = frontsCollectionsAndArticles.reduce(
		(acc, front) => acc.concat(front.collections),
		[] as CollectionWithArticles[],
	);
	const articles = collections.reduce(
		(acc, collection) => acc.concat(collection.articleIds),
		[] as string[],
	);
	return articles;
};

const selectEditorFrontIds = (state: GlobalState) =>
	state.editor.frontIdsByPriority;

const createSelectEditorFrontsByPriority = () =>
	createSelector(
		selectFronts,
		selectEditorFrontIds,
		selectPriority,
		(fronts, frontIdsByPriority, priority) => {
			if (!priority) {
				return [];
			}
			const openFrontIds = frontIdsByPriority[priority] || [];
			return compact(openFrontIds.map((frontId) => fronts[frontId]));
		},
	);

const selectEditorFavouriteFrontIds = (state: GlobalState) =>
	state.editor.favouriteFrontIdsByPriority;

const selectEditorFrontIdsByPriority = (
	state: GlobalState,
	priority: string,
): string[] => state.editor.frontIdsByPriority[priority] || [];

const defaultFavouriteFronts = [] as [];

const selectEditorFavouriteFrontIdsByPriority = (
	state: GlobalState,
	priority: string,
): string[] =>
	state.editor.favouriteFrontIdsByPriority[priority] || defaultFavouriteFronts;

const selectHasMultipleFrontsOpen = createSelector(
	selectEditorFrontIdsByPriority,
	(frontIdsByPriority) => {
		return frontIdsByPriority.length > 1;
	},
);

const defaultOpenForms = [] as [];

const selectOpenCardForms = (
	state: GlobalState,
	{ frontId }: { frontId: string },
) => state.editor.selectedCards[frontId] || defaultOpenForms;

const selectIsCardFormOpen = (
	state: GlobalState,
	cardId: string,
	frontId: string,
) => {
	return (selectOpenCardForms(state, { frontId }) || []).some(
		(_) => _.id === cardId,
	);
};

const createSelectCollectionIdsWithOpenForms = () =>
	createSelector(selectOpenCardForms, (forms) =>
		uniq(forms.map((_) => _.collectionId)),
	);

const createSelectDoesCollectionHaveOpenForms = () =>
	createSelector(
		selectOpenCardForms,
		(
			_: unknown,
			{ frontId, collectionId }: { frontId: string; collectionId: string },
		) => ({ frontId, collectionId }),
		(forms, { collectionId }) =>
			forms.some((form) => form.collectionId === collectionId),
	);

const selectCollectionId = (
	_: GlobalState,
	{ collectionId }: { collectionId: string },
) => collectionId;

const createSelectOpenCardIdsForCollection = () =>
	createSelector(
		selectOpenCardForms,
		selectCollectionId,
		(forms, collectionId) =>
			forms.filter((_) => _.collectionId === collectionId).map((_) => _.id),
	);

// NB: This selector is not memoized.
const createSelectOpenCardTitlesForCollection = () => {
	const selectOpenCardIdsForCollection = createSelectOpenCardIdsForCollection();
	const selectArticleFromCard = createSelectArticleFromCard();
	return (
		state: GlobalState,
		{ frontId, collectionId }: { frontId: string; collectionId: string },
	): Array<{ uuid: string; title: string | undefined }> => {
		const cardIds = selectOpenCardIdsForCollection(state, {
			collectionId,
			frontId,
		});
		return compact(
			cardIds
				.map((id) => selectArticleFromCard(state, id))
				.filter((_) => _)
				.map(
					(derivedArticle) =>
						derivedArticle && {
							uuid: derivedArticle.uuid,
							title: derivedArticle.headline || derivedArticle.customKicker,
						},
				),
		);
	};
};

const selectFrontBrowsingStage = (state: GlobalState, frontId: string) =>
	state.editor.frontIdsByBrowsingStage[frontId] || 'draft';

const selectAllArticleIdsForCollection = createSelectCardsInCollection();
const selectCurrentlyOpenCollectionsByFront =
	createSelectCurrentlyOpenCollectionsByFront();

const selectOpenFrontsCollectionsAndArticles = (
	state: GlobalState,
): Array<{ frontId: string; collections: CollectionWithArticles[] }> => {
	const openCollectionsByFront = selectCurrentlyOpenCollectionsByFront(state);
	return openCollectionsByFront.map((frontAndCollections) => {
		const browsingStage = selectFrontBrowsingStage(
			state,
			frontAndCollections.frontId,
		);
		const collections = frontAndCollections.collections.map((cId: string) => {
			const articleIds: string[] = selectAllArticleIdsForCollection(state, {
				collectionId: cId,
				collectionSet: browsingStage,
				includeSupportingArticles: false,
			});
			return {
				id: cId,
				articleIds,
			};
		});
		return {
			frontId: frontAndCollections.frontId,
			collections,
		};
	});
};

const defaultState = {
	showOpenFrontsMenu: false,
	frontIds: [],
	frontIdsByPriority: {},
	favouriteFrontIdsByPriority: {},
	collectionIds: [],
	clipboardOpen: true,
	closedOverviews: [],
	selectedCards: {},
	frontIdsByBrowsingStage: {},
};

const clearCardSelection = (state: State, cardId: string): State => {
	let frontId: string | null = null;
	for (const entry of Object.entries(state.selectedCards)) {
		const [currentFrontId, cardDatas] = entry;
		const currentCardDataIndex = cardDatas.findIndex((_) => _.id === cardId);
		if (currentCardDataIndex !== -1) {
			frontId = currentFrontId;
			break;
		}
	}

	if (!frontId) {
		return state;
	}

	return {
		...state,
		selectedCards: {
			...state.selectedCards,
			[frontId]: state.selectedCards[frontId].filter((_) => _.id !== cardId),
		},
	};
};

const getFrontPosition = (
	frontId: string,
	frontIdsByPriority: {
		[priority: string]: string[];
	},
): { frontId: string; priority: string; index: number } | void => {
	const positions = Object.entries(frontIdsByPriority)
		.filter(([_, frontIds]) => frontIds.indexOf(frontId) !== -1)
		.map(([priority, frontIds]) => ({
			frontId,
			priority,
			index: frontIds.indexOf(frontId),
		}));
	if (positions.length) {
		return positions[0];
	}
};

const reducer = (state: State = defaultState, action: Action): State => {
	switch (action.type) {
		case EDITOR_OPEN_CURRENT_FRONTS_MENU: {
			return {
				...state,
				showOpenFrontsMenu: true,
			};
		}

		case EDITOR_CLOSE_CURRENT_FRONTS_MENU: {
			return {
				...state,
				showOpenFrontsMenu: false,
			};
		}

		case EDITOR_OPEN_FRONT: {
			const priority = action.payload.priority;
			return {
				...state,
				frontIdsByPriority: {
					...state.frontIdsByPriority,
					[priority]: (state.frontIdsByPriority[priority] || []).concat(
						action.payload.frontId,
					),
				},
			};
		}

		case CHANGED_BROWSING_STAGE: {
			return {
				...state,
				frontIdsByBrowsingStage: {
					...state.frontIdsByBrowsingStage,
					[action.payload.frontId]: action.payload.browsingStage,
				},
			};
		}

		case EDITOR_MOVE_FRONT: {
			const maybeFrontPosition = getFrontPosition(
				action.payload.frontId,
				state.frontIdsByPriority,
			);
			if (!maybeFrontPosition) {
				return state;
			}
			const { priority, index } = maybeFrontPosition;
			const maxIndex = state.frontIdsByPriority[priority].length - 1;
			const indexesOutOfBounds = action.payload.toIndex > maxIndex;
			if (indexesOutOfBounds) {
				return state;
			}
			const newFrontIds = state.frontIdsByPriority[priority].slice();
			newFrontIds.splice(index, 1);
			newFrontIds.splice(action.payload.toIndex, 0, action.payload.frontId);
			return {
				...state,
				frontIdsByPriority: {
					...state.frontIdsByPriority,
					[priority]: newFrontIds,
				},
			};
		}
		case EDITOR_CLOSE_FRONT: {
			const maybeFrontPosition = getFrontPosition(
				action.payload.frontId,
				state.frontIdsByPriority,
			);
			if (!maybeFrontPosition) {
				return state;
			}
			const { priority } = maybeFrontPosition;
			return {
				...state,
				frontIdsByPriority: {
					...state.frontIdsByPriority,
					[priority]: without(
						state.frontIdsByPriority[priority],
						action.payload.frontId,
					),
				},
			};
		}
		case EDITOR_FAVOURITE_FRONT: {
			const priority = action.payload.priority;
			return {
				...state,
				favouriteFrontIdsByPriority: {
					...state.favouriteFrontIdsByPriority,
					[priority]: (
						state.favouriteFrontIdsByPriority[priority] || []
					).concat(action.payload.frontId),
				},
			};
		}
		case EDITOR_UNFAVOURITE_FRONT: {
			const priority = action.payload.priority;
			return {
				...state,
				favouriteFrontIdsByPriority: {
					...state.favouriteFrontIdsByPriority,
					[priority]: without(
						state.favouriteFrontIdsByPriority[priority],
						action.payload.frontId,
					),
				},
			};
		}
		case EDITOR_SET_FAVE_FRONTS: {
			return {
				...state,
				favouriteFrontIdsByPriority: action.payload.favouriteFrontIdsByPriority,
			};
		}
		case EDITOR_CLEAR_OPEN_FRONTS: {
			return {
				...state,
				frontIds: [],
				frontIdsByPriority: {},
			};
		}
		case EDITOR_SET_OPEN_FRONTS: {
			return {
				...state,
				frontIdsByPriority: action.payload.frontIdsByPriority,
			};
		}
		case EDITOR_OPEN_COLLECTION: {
			return {
				...state,
				collectionIds: state.collectionIds.concat(action.payload.collectionIds),
			};
		}
		case EDITOR_CLOSE_COLLECTION: {
			return {
				...state,
				collectionIds: without(
					state.collectionIds,
					...(Array.isArray(action.payload.collectionIds)
						? action.payload.collectionIds
						: [action.payload.collectionIds]),
				),
			};
		}
		case EDITOR_SELECT_CARD: {
			const currentlyOpenCards =
				state.selectedCards[action.payload.frontId] || [];
			const {
				frontId,
				collectionId,
				isSupporting,
				cardId: id,
			} = action.payload;
			const openCards = currentlyOpenCards.concat([
				{
					id,
					isSupporting,
					collectionId,
				},
			]);
			return {
				...state,
				selectedCards: {
					...state.selectedCards,
					[frontId]: openCards,
				},
			};
		}
		case EDITOR_CLEAR_CARD_SELECTION: {
			return clearCardSelection(state, action.payload.cardId);
		}
		case EDITOR_CLOSE_FORMS_FOR_COLLECTION: {
			const maybeOpenFormsForFront =
				state.selectedCards[action.payload.frontId];

			if (!maybeOpenFormsForFront) {
				return state;
			}
			return maybeOpenFormsForFront.reduce(
				(acc, formData) =>
					formData.collectionId === action.payload.collectionId
						? clearCardSelection(acc, formData.id)
						: acc,
				state,
			);
		}
		case REMOVE_SUPPORTING_CARD:
		case REMOVE_GROUP_CARD:
		case 'REMOVE_CLIPBOARD_CARD': {
			const cardId = action.payload.cardId;
			return clearCardSelection(state, cardId);
		}
		case EDITOR_OPEN_CLIPBOARD: {
			return {
				...state,
				clipboardOpen: true,
			};
		}
		case EDITOR_CLOSE_CLIPBOARD: {
			return {
				...state,
				clipboardOpen: false,
			};
		}
		case EDITOR_OPEN_OVERVIEW: {
			return {
				...state,
				closedOverviews: state.closedOverviews.filter(
					(id) => id !== action.payload.frontId,
				),
			};
		}
		case EDITOR_CLOSE_OVERVIEW: {
			return {
				...state,
				closedOverviews: state.closedOverviews.concat(action.payload.frontId),
			};
		}
		case EDITOR_OPEN_ALL_OVERVIEWS: {
			return {
				...state,
				closedOverviews: [],
			};
		}
		case EDITOR_CLOSE_ALL_OVERVIEWS: {
			return {
				...state,
				closedOverviews: [...state.frontIds],
			};
		}
		default: {
			return state;
		}
	}
};

export {
	editorOpenCurrentFrontsMenu as editorShowOpenFrontsMenu,
	editorCloseCurrentFrontsMenu as editorHideOpenFrontsMenu,
	editorOpenFront,
	editorMoveFront,
	editorCloseFront,
	editorFavouriteFront,
	editorUnfavouriteFront,
	editorSetFavouriteFronts,
	editorClearOpenFronts,
	editorSetOpenFronts,
	editorOpenCollections,
	editorCloseCollections,
	editorSelectCard,
	editorClearCardSelection,
	selectIsCurrentFrontsMenuOpen,
	selectIsCardFormOpen,
	selectOpenCardForms,
	selectOpenParentFrontOfCard,
	createSelectDoesCollectionHaveOpenForms,
	createSelectOpenCardTitlesForCollection,
	createSelectEditorFrontsByPriority,
	createSelectFrontIdWithOpenAndStarredStatesByPriority,
	selectEditorFrontIds,
	selectEditorFavouriteFrontIds,
	selectEditorFrontIdsByPriority,
	selectEditorFavouriteFrontIdsByPriority,
	selectOpenFrontsCollectionsAndArticles,
	createSelectCollectionsInOpenFronts,
	selectOpenCardIds,
	selectIsCollectionOpen,
	editorOpenClipboard,
	editorCloseClipboard,
	editorOpenOverview,
	editorCloseOverview,
	editorOpenAllOverviews,
	editorCloseAllOverviews,
	selectIsClipboardOpen,
	selectIsFrontOverviewOpen,
	selectHasMultipleFrontsOpen,
	createSelectCollectionIdsWithOpenForms,
	createSelectOpenCardIdsForCollection,
	OpenCardData,
	changedBrowsingStage,
	EditorCloseFormsForCollection,
	editorCloseFormsForCollection,
	defaultState,
	State,
};

export default reducer;
