import type { Action } from 'types/Action';
import type { State } from 'types/State';
import type { Card } from 'types/Collection';

import { actions as externalArticleActions } from 'bundles/externalArticlesBundle';
import { selectEditMode } from '../selectors/pathSelectors';
import {
	insertGroupCard,
	insertSupportingCard,
	removeGroupCard,
	removeSupportingCard,
	updateCardMeta,
	cardsReceived,
	maybeAddFrontPublicationDate,
	copyCardImageMeta,
} from 'actions/CardsCommon';
import {
	selectCards,
	selectCard,
	selectArticleGroup,
	selectGroups,
} from 'selectors/shared';
import { ThunkResult, Dispatch } from 'types/Store';
import { addPersistMetaToAction } from 'util/action';
import { cloneCard } from 'util/card';
import {
	getFromGroupIndicesWithRespectToState,
	getToGroupIndicesWithRespectToState,
} from 'util/moveUtils';
import { PosSpec } from 'lib/dnd';
import { removeClipboardCard } from './Clipboard';
import { thunkInsertClipboardCard } from './ClipboardThunks';
import { capGroupSiblings } from 'actions/Groups';
import { selectCollectionCap } from 'selectors/configSelectors';
import { getImageMetaFromValidationResponse } from 'util/form';
import { ValidationResponse } from 'util/validateImageSrc';
import { MappableDropType } from 'util/collectionUtils';
import { selectWillCollectionHitCollectionCap } from 'selectors/collectionSelectors';
import { batchActions } from 'redux-batched-actions';
import noop from 'lodash/noop';
import { selectOpenParentFrontOfCard } from 'bundles/frontsUI';
import { getPageViewData } from 'actions/PageViewData';
import { startOptionsModal } from './OptionsModal';
import { getCardEntitiesFromDrop } from 'util/card';
import {
	RemoveActionCreator,
	InsertActionCreator,
	InsertThunkActionCreator,
} from 'types/Cards';
import { FLEXIBLE_GENERAL_NAME } from 'constants/flexibleContainers';
import { PersistTo } from '../types/Middleware';
import { selectors as collectionSelectors } from '../bundles/collectionsBundle';

// Creates a thunk action creator from a plain action creator that also allows
// passing a persistence location
// we need to create thunks for these to help TS as we may be dispatching either
// an Action or a ThunkAction in some cases. The redux-thunk types don't support
// this so we can make a thunk instead
// the persistence stuff needs to be dynamic as we sometimes need to insert an
// card and save to clipboard and sometimes save to collection
// depending on the location of that card
const createInsertCardThunk =
	(action: InsertActionCreator) =>
	(persistTo: 'collection' | 'clipboard') =>
	(id: string, index: number, cardId: string, removeAction?: Action) =>
	(dispatch: Dispatch) => {
		if (removeAction) {
			dispatch(removeAction);
		}

		// This cast seems to be necessary to disambiguate the type fed to Dispatch,
		// whose call signature accepts either an Action or a ThunkResult. I'm not really
		// sure why.
		dispatch(action(id, index, cardId, persistTo) as Action);
	};

const copyCardImageMetaWithPersist = addPersistMetaToAction(copyCardImageMeta, {
	persistTo: 'collection',
	key: 'to',
});

// Creates a thunk with persistence that will launch a confirm modal if required
// when adding to a group, otherwise will just run the action
// the confirm modal links to the collection caps
const maybeInsertGroupCard =
	(persistTo: 'collection' | 'clipboard') =>
	(id: string, index: number, cardId: string, removeAction?: Action) => {
		return (dispatch: Dispatch, getState: () => State) => {
			// require a modal!
			const state = getState();

			const collectionCap = selectCollectionCap(state);

			const willCollectionHitCollectionCap =
				selectWillCollectionHitCollectionCap(
					state,
					id,
					index,
					cardId,
					collectionCap,
				);

			const confirmRemoval = () => {
				const actions = [];

				if (removeAction) {
					actions.push(removeAction);
				}

				actions
					.concat([
						insertGroupCard(id, index, cardId, persistTo),
						maybeAddFrontPublicationDate(cardId),
						addPersistMetaToAction(capGroupSiblings, {
							id: cardId,
							persistTo,
							applyBeforeReducer: true,
						})(id, collectionCap),
					])
					.forEach((action) => dispatch(action));
			};

			if (willCollectionHitCollectionCap) {
				// if there are too many cards now then launch a modal to ask the user
				// what action to take
				dispatch(
					startOptionsModal(
						'Collection limit',
						`You can have a maximum of ${collectionCap} articles in a collection.
          You can proceed, and the last article in the collection will be
          removed automatically, or you can cancel and remove articles from the
          collection yourself.`,
						// if the user accepts, then remove the moved item (if there was one),
						// remove cards past the cap count and finally persist
						[
							{
								buttonText: 'Confirm',
								callback: confirmRemoval,
							},
						],
						// otherwise do nothing
						noop,
						true,
					),
				);
			} else {
				// if we're not going over the cap then just remove a moved article if
				// needed and insert the new article
				dispatch(
					batchActions(
						(removeAction ? [removeAction] : []).concat([
							maybeAddFrontPublicationDate(cardId),
							insertGroupCard(id, index, cardId, persistTo),
						]),
					),
				);
			}
		};
	};

const addActionMap: { [type: string]: InsertThunkActionCreator | undefined } = {
	card: createInsertCardThunk(insertSupportingCard),
	group: maybeInsertGroupCard,
	clipboard: createInsertCardThunk(thunkInsertClipboardCard),
};

// This maps a type string such as `clipboard` to an insert action creator and
// if persistTo is passed then the action creator will add persist meta
// these are expected to be thunks that can be passed actions to run if an
// insert was possible
const getInsertionActionCreatorFromType = (
	type: string,
	persistTo: 'collection' | 'clipboard',
) => {
	const actionCreator = addActionMap[type] || null;

	// partially apply the action creator with it's persist logic
	return actionCreator && actionCreator(persistTo);
};

const removeActionMap: { [type: string]: RemoveActionCreator | undefined } = {
	card: removeSupportingCard,
	group: removeGroupCard,
	clipboard: removeClipboardCard,
};

// this maps a type string such as `group` to a remove action creator and if
// persistTo is passed then add persist meta
const getRemoveActionCreatorFromType = (
	type: string,
	persistTo?: 'collection' | 'clipboard',
) => {
	const actionCreator = removeActionMap[type] || null;

	return actionCreator && persistTo
		? addPersistMetaToAction(actionCreator, {
				persistTo,
				key: 'cardId',
				applyBeforeReducer: true,
			})
		: actionCreator;
};

const updateCardMetaWithPersist = (persistTo: PersistTo) =>
	addPersistMetaToAction(updateCardMeta, {
		persistTo,
	});

const minimumGroupBoostLevel = (groupName: string) => {
	switch (groupName) {
		case 'very big':
			return 'megaboost';
		case 'big':
			return 'boost';
		case 'splash':
		case 'standard':
		default:
			return 'default';
	}
};

const isFlexibleGeneralContainer = (state: State, collectionId: string) => {
	const collection = collectionSelectors.selectById(state, collectionId);
	return collection?.type === FLEXIBLE_GENERAL_NAME;
};
/**
 * When a card moves up or down one or more groups,
 * it should adopt the minimum boost level
 * of the group it moves into, regardless of its previous boost level.
 * */
const mayResetBoostLevel = (
	state: State,
	from: PosSpec | null,
	to: PosSpec,
	card: Card,
	persistTo: 'collection' | 'clipboard',
) => {
	if (to.type !== 'group' || !to.collectionId || persistTo !== 'collection')
		return;
	if (from?.id === to.id) return;
	if (!isFlexibleGeneralContainer(state, to.collectionId)) return;
	const toGroup = selectGroups(state)[to.id];
	const groupName = toGroup?.name ?? 'standard';
	return updateCardMeta(
		card.uuid,
		{
			boostLevel: minimumGroupBoostLevel(groupName),
		},
		{ merge: true },
	);
};

const insertCardWithCreate =
	(
		to: PosSpec,
		drop: MappableDropType,
		persistTo: 'collection' | 'clipboard',
		// allow the factory to be injected for testing
		cardFactory = createArticleEntitiesFromDrop,
	): ThunkResult<void> =>
	async (dispatch: Dispatch, getState) => {
		const insertActionCreator = getInsertionActionCreatorFromType(
			to.type,
			persistTo,
		);
		if (!insertActionCreator) {
			return;
		}
		const state = getState();
		const toWithRespectToState = getToGroupIndicesWithRespectToState(
			to,
			state,
			false,
		);
		if (toWithRespectToState) {
			try {
				const card = await dispatch(cardFactory(drop, to));
				if (!card) {
					return;
				}

				const modifyCardAction = mayResetBoostLevel(
					state,
					null,
					to,
					card,
					persistTo,
				);

				if (modifyCardAction) dispatch(modifyCardAction);

				dispatch(
					insertActionCreator(
						toWithRespectToState.id,
						toWithRespectToState.index,
						card.uuid,
					),
				);

				// Fetch ophan data
				const [frontId, collectionId] = selectOpenParentFrontOfCard(
					getState(),
					card.uuid,
				);
				if (frontId && collectionId) {
					await dispatch(getPageViewData(frontId, collectionId, [card.uuid]));
				}
			} catch (e) {
				// Insert failed -- @todo handle error
			}
		}
	};

const removeCard = (
	type: string,
	collectionId: string,
	cardId: string,
	persistTo: 'collection' | 'clipboard',
): ThunkResult<void> => {
	return (dispatch: Dispatch, getState) => {
		const getGroupIdFromState = () => {
			if (collectionId === 'clipboard') {
				return collectionId;
			}
			// The card may belong to an orphaned group -
			// we need to find the actual group the card belongs to
			const idFromState = selectArticleGroup(getState(), collectionId, cardId);
			if (idFromState) {
				return idFromState;
			}
			// If we could not find a group id the card belongs to
			// then this article is a sublink and we don't have to adjust the id
			return collectionId;
		};
		const groupIdFromState = getGroupIdFromState();
		const removeActionCreator = getRemoveActionCreatorFromType(type, persistTo);
		if (!removeActionCreator) {
			return;
		}
		dispatch(removeActionCreator(groupIdFromState, cardId));
	};
};

const moveCard = (
	to: PosSpec,
	card: Card,
	from: PosSpec | null,
	persistTo: 'collection' | 'clipboard',
): ThunkResult<void> => {
	return (dispatch: Dispatch, getState) => {
		const removeActionCreator =
			from && getRemoveActionCreatorFromType(from.type, persistTo);
		const insertActionCreator = getInsertionActionCreatorFromType(
			to.type,
			persistTo,
		);

		if (!insertActionCreator) {
			return;
		}

		const state = getState();

		// If move actions are happening to/from groups which have cards displayed
		// in them which don't belong to these groups we need to adjust the indices of the move
		// actions in these groups.
		const fromDetails: {
			fromWithRespectToState: PosSpec | null;
			fromOrphanedGroup: boolean;
		} = getFromGroupIndicesWithRespectToState(from, state);

		const toWithRespectToState: PosSpec | null =
			getToGroupIndicesWithRespectToState(
				to,
				state,
				fromDetails.fromOrphanedGroup,
			);
		if (toWithRespectToState) {
			const { fromWithRespectToState } = fromDetails;

			// if from is not null then assume we're copying a moved card
			// into this new position
			const { parent, supporting } = !fromWithRespectToState
				? cloneCard(card, selectCards(state))
				: { parent: card, supporting: [] };

			if (toWithRespectToState) {
				if (!fromWithRespectToState) {
					dispatch(cardsReceived([parent, ...supporting]));
				}

				const modifyCardAction = mayResetBoostLevel(
					state,
					from,
					to,
					parent,
					persistTo,
				);
				if (modifyCardAction) dispatch(modifyCardAction);

				dispatch(
					insertActionCreator(
						toWithRespectToState.id,
						toWithRespectToState.index,
						parent.uuid,
						fromWithRespectToState && removeActionCreator
							? removeActionCreator(fromWithRespectToState.id, card.uuid)
							: undefined,
					),
				);
			}
		}
	};
};

const cloneCardToTarget = (
	uuid: string,
	toType: 'clipboard' | 'collection',
): ThunkResult<void> => {
	return (dispatch, getState) => {
		const to = { id: toType, type: toType, index: 0 };
		const card = selectCard(getState(), uuid);
		const from = null;
		dispatch(moveCard(to, card, from, toType));
	};
};

const addCardToClipboard = (uuid: string) =>
	cloneCardToTarget(uuid, 'clipboard');

const addImageToCard =
	(persistTo: PersistTo) => (uuid: string, imageData: ValidationResponse) =>
		updateCardMetaWithPersist(persistTo)(
			uuid,
			{
				...getImageMetaFromValidationResponse(imageData),
				imageReplace: true,
				imageCutoutReplace: false,
				imageSlideshowReplace: false,
			},
			{ merge: true },
		);

/**
 * Create the appropriate article entities from a MappableDropType,
 * and add them to the application state.
 */
export const createArticleEntitiesFromDrop = (
	drop: MappableDropType,
	to?: PosSpec,
): ThunkResult<Promise<Card | undefined>> => {
	return async (dispatch, getState) => {
		const isEdition = selectEditMode(getState()) === 'editions';
		const { card, supportingCards, externalArticle } =
			await getCardEntitiesFromDrop(drop, isEdition, dispatch, getState(), to);

		if (externalArticle) {
			dispatch(externalArticleActions.fetchSuccess(externalArticle));
		}
		let cardsToAddToTheState: Card[] = [];
		if (card) {
			if (supportingCards) cardsToAddToTheState = [card, ...supportingCards];
			else cardsToAddToTheState = [card];
		}

		dispatch(cardsReceived(cardsToAddToTheState));
		return card;
	};
};

export {
	insertCardWithCreate,
	moveCard,
	updateCardMetaWithPersist,
	removeCard,
	addImageToCard,
	copyCardImageMetaWithPersist,
	cloneCardToTarget,
	addCardToClipboard,
};
