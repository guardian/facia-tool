import {
  insertGroupCard,
  insertSupportingCard,
  removeGroupCard,
  removeSupportingCard,
  updateCardMeta,
  createArticleEntitiesFromDrop,
  cardsReceived,
  maybeAddFrontPublicationDate,
  copyCardImageMeta
} from 'shared/actions/Cards';
import { Card } from 'shared/types/Collection';
import {
  selectSharedState,
  selectCards,
  selectCard,
  selectArticleGroup
} from 'shared/selectors/shared';
import { ThunkResult, Dispatch } from 'types/Store';
import { addPersistMetaToAction } from 'util/action';
import { cloneCard } from 'shared/util/card';
import {
  getFromGroupIndicesWithRespectToState,
  getToGroupIndicesWithRespectToState
} from 'util/moveUtils';
import { PosSpec } from 'lib/dnd';
import { Action } from 'types/Action';
import { removeClipboardCard, thunkInsertClipboardCard } from './Clipboard';
import { State } from 'types/State';
import { capGroupSiblings } from 'shared/actions/Groups';
import { selectCollectionCap } from 'selectors/configSelectors';
import { getImageMetaFromValidationResponse } from 'util/form';
import { ValidationResponse } from 'shared/util/validateImageSrc';
import { MappableDropType } from 'util/collectionUtils';
import { selectWillCollectionHitCollectionCap } from 'selectors/collectionSelectors';
import { batchActions } from 'redux-batched-actions';
import noop from 'lodash/noop';
import { selectOpenParentFrontOfCard } from 'bundles/frontsUIBundle';
import { getPageViewData } from 'redux/modules/pageViewData';
import { startOptionsModal } from './OptionsModal';

type InsertActionCreator = (
  id: string,
  index: number,
  cardId: string
) => ThunkResult<void> | Action;

type InsertThunkActionCreator = (
  persistTo: 'collection' | 'clipboard'
) => (
  id: string,
  index: number,
  cardId: string,
  removeAction?: Action
) => ThunkResult<void>;

// Creates a thunk action creator from a plain action creator that also allows
// passing a persistence location
// we need to create thunks for these to help TS as we may be dispatching either
// an Action or a ThunkAction in some cases. The redux-thunk types don't support
// this so we can make a thunk instead
// the persistence stuff needs to be dynamic as we sometimes need to insert an
// card and save to clipboard and sometimes save to collection
// depending on the location of that card
const createInsertCardThunk = (action: InsertActionCreator) => () => (
  id: string,
  index: number,
  cardId: string,
  removeAction?: Action
) => (dispatch: Dispatch) => {
  if (removeAction) {
    dispatch(removeAction);
  }
  // This cast seems to be necessary to disambiguate the type fed to Dispatch,
  // whose call signature accepts either an Action or a ThunkResult. I'm not really
  // sure why.
  dispatch(action(id, index, cardId) as Action);
};

const copyCardImageMetaWithPersist = addPersistMetaToAction(copyCardImageMeta, {
  persistTo: 'collection',
  key: 'to'
});

// Creates a thunk with persistence that will launch a confirm modal if required
// when adding to a group, otherwise will just run the action
// the confirm modal links to the collection caps
const maybeInsertGroupCard = (persistTo: 'collection' | 'clipboard') => (
  id: string,
  index: number,
  cardId: string,
  removeAction?: Action
) => {
  return (dispatch: Dispatch, getState: () => State) => {
    // require a modal!
    const state = getState();

    const collectionCap = selectCollectionCap(state);

    const willCollectionHitCollectionCap = selectWillCollectionHitCollectionCap(
      state,
      id,
      index,
      cardId,
      collectionCap
    );

    const confirmRemoval = () => {
      const actions = [];

      if (removeAction) {
        actions.push(removeAction);
      }

      actions
        .concat([
          insertGroupCard(id, index, cardId),
          maybeAddFrontPublicationDate(cardId),
          addPersistMetaToAction(capGroupSiblings, {
            id: cardId,
            persistTo,
            applyBeforeReducer: true
          })(id, collectionCap)
        ])
        .forEach(action => dispatch(action));
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
              callback: confirmRemoval
            }
          ],
          // otherwise do nothing
          noop,
          true
        )
      );
    } else {
      // if we're not going over the cap then just remove a moved article if
      // needed and insert the new article
      dispatch(
        batchActions(
          (removeAction ? [removeAction] : []).concat([
            maybeAddFrontPublicationDate(cardId),
            addPersistMetaToAction(insertGroupCard, {
              key: 'cardId',
              persistTo
            })(id, index, cardId)
          ])
        )
      );
    }
  };
};

// This maps a type string such as `clipboard` to an insert action creator and
// if persistTo is passed then the action creator will add persist meta
// these are expected to be thunks that can be passed actions to run if an
// insert was possible
const getInsertionActionCreatorFromType = (
  type: string,
  persistTo: 'collection' | 'clipboard'
) => {
  const actionMap: { [type: string]: InsertThunkActionCreator | undefined } = {
    card: createInsertCardThunk(insertSupportingCard),
    group: maybeInsertGroupCard,
    clipboard: createInsertCardThunk(thunkInsertClipboardCard)
  };

  const actionCreator = actionMap[type] || null;

  // partially apply the action creator with it's persist logic
  return actionCreator && actionCreator(persistTo);
};

type RemoveActionCreator = (id: string, cardId: string) => Action;

// this maps a type string such as `group` to a remove action creator and if
// persistTo is passed then add persist meta
const getRemoveActionCreatorFromType = (
  type: string,
  persistTo?: 'collection' | 'clipboard'
) => {
  const actionMap: { [type: string]: RemoveActionCreator | undefined } = {
    card: removeSupportingCard,
    group: removeGroupCard,
    clipboard: removeClipboardCard
  };

  const actionCreator = actionMap[type] || null;

  return actionCreator && persistTo
    ? addPersistMetaToAction(actionCreator, {
        persistTo,
        key: 'cardId',
        applyBeforeReducer: true
      })
    : actionCreator;
};

const updateCardMetaWithPersist = addPersistMetaToAction(updateCardMeta, {
  persistTo: 'collection'
});

const updateClipboardCardMetaWithPersist = addPersistMetaToAction(
  updateCardMeta,
  {
    persistTo: 'clipboard'
  }
);

const insertCardWithCreate = (
  to: PosSpec,
  drop: MappableDropType,
  persistTo: 'collection' | 'clipboard',
  // allow the factory to be injected for testing
  cardFactory = createArticleEntitiesFromDrop
): ThunkResult<void> => async (dispatch: Dispatch, getState) => {
  const insertActionCreator = getInsertionActionCreatorFromType(
    to.type,
    persistTo
  );
  if (!insertActionCreator) {
    return;
  }
  const sharedState = selectSharedState(getState());
  const toWithRespectToState = getToGroupIndicesWithRespectToState(
    to,
    sharedState,
    false
  );
  if (toWithRespectToState) {
    try {
      const card = await dispatch(cardFactory(drop));
      if (!card) {
        return;
      }
      dispatch(
        insertActionCreator(
          toWithRespectToState.id,
          toWithRespectToState.index,
          card.uuid
        )
      );

      // Fetch ophan data
      const [frontId, collectionId] = selectOpenParentFrontOfCard(
        getState(),
        card.uuid
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
  persistTo: 'collection' | 'clipboard'
): ThunkResult<void> => {
  return (dispatch: Dispatch, getState) => {
    const getGroupIdFromState = () => {
      if (collectionId === 'clipboard') {
        return collectionId;
      }
      // The card may belong to an orphaned group -
      // we need to find the actual group the card belongs to
      const idFromState = selectArticleGroup(
        selectSharedState(getState()),
        collectionId,
        cardId
      );
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
  persistTo: 'collection' | 'clipboard'
): ThunkResult<void> => {
  return (dispatch: Dispatch, getState) => {
    const removeActionCreator =
      from && getRemoveActionCreatorFromType(from.type, persistTo);
    const insertActionCreator = getInsertionActionCreatorFromType(
      to.type,
      persistTo
    );

    if (!insertActionCreator) {
      return;
    }

    const sharedState = selectSharedState(getState());

    // If move actions are happening to/from groups which have cards displayed
    // in them which don't belong to these groups we need to adjust the indices of the move
    // actions in these groups.
    const fromDetails: {
      fromWithRespectToState: PosSpec | null;
      fromOrphanedGroup: boolean;
    } = getFromGroupIndicesWithRespectToState(from, sharedState);

    const toWithRespectToState: PosSpec | null = getToGroupIndicesWithRespectToState(
      to,
      sharedState,
      fromDetails.fromOrphanedGroup
    );
    if (toWithRespectToState) {
      const { fromWithRespectToState } = fromDetails;

      // if from is not null then assume we're copying a moved card
      // into this new position
      const { parent, supporting } = !fromWithRespectToState
        ? cloneCard(card, selectCards(sharedState))
        : { parent: card, supporting: [] };

      if (toWithRespectToState) {
        if (!fromWithRespectToState) {
          dispatch(cardsReceived([parent, ...supporting]));
        }

        dispatch(
          insertActionCreator(
            toWithRespectToState.id,
            toWithRespectToState.index,
            parent.uuid,
            fromWithRespectToState && removeActionCreator
              ? removeActionCreator(fromWithRespectToState.id, card.uuid)
              : undefined
          )
        );
      }
    }
  };
};

const cloneCardToTarget = (
  uuid: string,
  toType: 'clipboard' | 'collection'
): ThunkResult<void> => {
  return (dispatch, getState) => {
    const to = { id: toType, type: toType, index: 0 };
    const card = selectCard(selectSharedState(getState()), uuid);
    const from = null;
    dispatch(moveCard(to, card, from, toType));
  };
};

const addCardToClipboard = (uuid: string) =>
  cloneCardToTarget(uuid, 'clipboard');

const addImageToCard = (uuid: string, imageData: ValidationResponse) =>
  updateCardMetaWithPersist(
    uuid,
    {
      ...getImageMetaFromValidationResponse(imageData),
      imageReplace: true,
      imageCutoutReplace: false,
      imageSlideshowReplace: false
    },
    { merge: true }
  );

export {
  insertCardWithCreate as insertCard,
  moveCard,
  updateCardMetaWithPersist as updateCardMeta,
  updateClipboardCardMetaWithPersist as updateClipboardCardMeta,
  removeCard,
  addImageToCard,
  copyCardImageMetaWithPersist,
  cloneCardToTarget,
  addCardToClipboard
};