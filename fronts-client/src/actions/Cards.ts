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
	selectGroupCollection,
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
	BoostLevel,
} from 'types/Cards';
import { FLEXIBLE_GENERAL_NAME } from 'constants/flexibleContainers';
import { PersistTo } from '../types/Middleware';

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

/** Groups in a flexible general container allow different boostlevel options.
 * When moving a card from the one group to another, this function checks if the card should be modified.
 * If so, it will automatically adjust the boost level to what is possible or the default in the group.
 * Very Big defaults to mega, big defaults to boost
 * Splash allows all levels, and standard does not allow gigaboost.
 * Group ids remain consistent, even if the group is hidden (when maxItems is set to 0), so we can use the id to determine the group.
 */
const boostLevels: BoostLevel[] = [
	'default',
	'boost',
	'megaboost',
	'gigaboost',
] as const;

const minimumGroupBoostLevel = (groupId: number) => {
	// boost is the smallest boost level for `Big`
	if (groupId === 1) return 'boost';
	// megaboost is the smallest boost level for `Very Big`
	if (groupId === 2) return 'megaboost';
	return 'default';
};

/**
 * If the card is moved to a splash (group 3) group, we always set the boost level to default
 * If the card already has the minimum boost level for the group it is moving to,
 * we don't want to go any lower.
 * Otherwise, we decrease the boost level by 1.
 */
const getBoostLevel = (
	maybeFromGroupId: number | null,
	toGroupId: number,
	boostIndex: number,
): BoostLevel => {
	const minBoostLevel = minimumGroupBoostLevel(toGroupId);
	const minBoostIndex = boostLevels.indexOf(minBoostLevel);

	// If the current boost level is below the minimum required, set it to the minimum
	if (boostIndex < minBoostIndex) {
		return minBoostLevel;
	}

	// If the current boost level is the minimum required, don't change it
	if (boostIndex === minBoostIndex) {
		return boostLevels[boostIndex];
	}

	// If we're not moving from a group (i.e. we are moving from a clipboard), retain the boost level
	if (maybeFromGroupId === null) {
		return boostLevels[boostIndex];
	}

	// If we're moving down a group, reduce the boost level by 1
	if (toGroupId < maybeFromGroupId) {
		return boostLevels[boostIndex - 1];
	}

	// If we're moving up a group, and the destination group is a splash group, set the boost level to default
	// (Splash groups allow all types of boosting, but we want to reserve these boost types for special occasions)
	if (toGroupId > maybeFromGroupId && toGroupId === 3) {
		return 'default';
	}

	// Retain the boost level if none of the other cases are met
	return boostLevels[boostIndex];
};

const mayAdjustCardBoostLevelForDestinationGroup = (
	state: State,
	maybeFrom: PosSpec | null,
	to: PosSpec,
	card: Card,
	persistTo: 'collection' | 'clipboard',
) => {
	if (to.type === 'group' && persistTo === 'collection') {
		const maybeFromGroupId =
			maybeFrom !== null && maybeFrom.type === 'group' ? maybeFrom.id : null;
		const maybeFromGroup =
			maybeFromGroupId !== null ? selectGroups(state)[maybeFromGroupId] : null;

		const toGroupId = to.id;
		const { collection } = selectGroupCollection(state, toGroupId);
		const toGroup = selectGroups(state)[toGroupId];

		if (collection?.type === FLEXIBLE_GENERAL_NAME) {
			if (!toGroup) {
				return;
			}
			const maybeFromGroupId =
				maybeFromGroup !== null ? parseInt(maybeFromGroup.id ?? '0') : null;
			const toGroupId = parseInt(toGroup.id ?? '0');

			const currentBoostLevel = boostLevels.indexOf(
				card.meta.boostLevel ?? 'default',
			);

			const boostLevel = getBoostLevel(
				maybeFromGroupId,
				toGroupId,
				currentBoostLevel,
			);
			return updateCardMeta(
				card.uuid,
				{
					boostLevel,
				},
				{ merge: true },
			);
		}
	}
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
				const modifyCardAction = mayAdjustCardBoostLevelForDestinationGroup(
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

				const modifyCardAction = mayAdjustCardBoostLevelForDestinationGroup(
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
	getBoostLevel,
};
