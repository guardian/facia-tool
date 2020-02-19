import { capGroupSiblings } from 'actions/Groups';
import { startOptionsModal } from 'actions/OptionsModal';
import { selectOpenParentFrontOfCard } from 'bundles/frontsUIBundle';
import { PosSpec } from 'lib/dnd';
import keyBy from 'lodash/keyBy';
import noop from 'lodash/noop';
import { batchActions } from 'redux-batched-actions';
import { getPageViewData } from 'redux/modules/pageViewData';
import { selectWillCollectionHitCollectionCap } from 'selectors/collectionSelectors';
import { selectCollectionCap } from 'selectors/configSelectors';
import { getAtomFromCapi, getContent, transformExternalArticle } from 'services/faciaApi';
import { actions as externalArticleActions } from 'shared/bundles/externalArticlesBundle';
import { selectArticleGroup, selectCard, selectCards, selectSharedState } from 'shared/selectors/shared';
import {
  CardsReceived,
  ClearCards,
  InsertGroupCard,
  InsertSupportingCard,
  MaybeAddFrontPublicationDate,
  RemoveGroupCard,
  RemoveSupportingCard,
  UpdateCardMeta,
} from 'shared/types/Action';
import { Card } from 'shared/types/Collection';
import { Card, CardMeta } from '../types/Collection';
import { ExternalArticle } from 'shared/types/ExternalArticle';
import { cloneCard, createCard } from 'shared/util/card';
import { createAtomSnap, createLatestSnap, createSnap } from 'shared/util/snap';
import { getAbsolutePath, isCapiUrl, isGuardianUrl, isValidURL } from 'shared/util/url';
import { ValidationResponse } from 'shared/util/validateImageSrc';
import { Action } from 'types/Action';
import { CapiArticle } from 'types/Capi';
import { State } from 'types/State';
import { Dispatch, ThunkResult } from 'types/Store';
import { addPersistMetaToAction } from 'util/action';
import { getIdFromURL } from 'util/CAPIUtils';
import { MappableDropType } from 'util/collectionUtils';
import { getImageMetaFromValidationResponse } from 'util/form';
import { getFromGroupIndicesWithRespectToState, getToGroupIndicesWithRespectToState } from 'util/moveUtils';

import { selectEditMode } from '../selectors/pathSelectors';
import { removeClipboardCard, thunkInsertClipboardCard } from './Clipboard';

export const UPDATE_CARD_META = 'SHARED/UPDATE_CARD_META';
export const CARDS_RECEIVED = 'SHARED/CARDS_RECEIVED';
export const CLEAR_CARDS = 'SHARED/CLEAR_CARDS';
export const REMOVE_GROUP_CARD = 'SHARED/REMOVE_GROUP_CARD';
export const REMOVE_SUPPORTING_CARD = 'SHARED/REMOVE_SUPPORTING_CARD';
export const INSERT_GROUP_CARD = 'SHARED/INSERT_GROUP_CARD';
export const INSERT_SUPPORTING_CARD = 'SHARED/INSERT_SUPPORTING_CARD';
export const COPY_CARD_IMAGE_META = 'SHARED/COPY_CARD_IMAGE_META';



type InsertActionCreator = (
  id: string,
  index: number,
  cardId: string,
  persistTo: 'collection' | 'clipboard'
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
const createInsertCardThunk = (action: InsertActionCreator) => (
  persistTo: 'collection' | 'clipboard'
) => (id: string, index: number, cardId: string, removeAction?: Action) => (
  dispatch: Dispatch
) => {
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
          insertGroupCard(id, index, cardId, persistTo),
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
            insertGroupCard(id, index, cardId, persistTo)
          ])
        )
      );
    }
  };
};

const insertSupportingCard = (
  id: string,
  index: number,
  cardId: string,
  persistTo: 'collection' | 'clipboard'
): InsertSupportingCard => ({
  type: INSERT_SUPPORTING_CARD,
  payload: {
    id,
    index,
    cardId
  },
  meta: {
    persistTo,
    key: 'cardId'
  }
});

const addActionMap: { [type: string]: InsertThunkActionCreator | undefined } = {
  card: createInsertCardThunk(insertSupportingCard),
  group: maybeInsertGroupCard,
  clipboard: createInsertCardThunk(thunkInsertClipboardCard)
};

// This maps a type string such as `clipboard` to an insert action creator and
// if persistTo is passed then the action creator will add persist meta
// these are expected to be thunks that can be passed actions to run if an
// insert was possible
const getInsertionActionCreatorFromType = (
  type: string,
  persistTo: 'collection' | 'clipboard'
) => {
  const actionCreator = addActionMap[type] || null;

  // partially apply the action creator with it's persist logic
  return actionCreator && actionCreator(persistTo);
};

type RemoveActionCreator = (id: string, cardId: string) => Action;

const removeActionMap: { [type: string]: RemoveActionCreator | undefined } = {
  card: removeSupportingCard,
  group: removeGroupCard,
  clipboard: removeClipboardCard
};

// this maps a type string such as `group` to a remove action creator and if
// persistTo is passed then add persist meta
const getRemoveActionCreatorFromType = (
  type: string,
  persistTo?: 'collection' | 'clipboard'
) => {
  const actionCreator = removeActionMap[type] || null;

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

// --- ADD SHARED FILE CODE HERE --- //



  function updateCardMeta(
    id: string,
    meta: CardMeta,
    { merge }: { merge: boolean } = { merge: false }
  ): UpdateCardMeta {
    return {
      type: UPDATE_CARD_META,
      payload: {
        id,
        meta,
        merge
      }
    };
  }

  // This can accept either a map of cards or an array (from which a
  // map will be generated)
  function cardsReceived(
    cards:
      | {
          [uuid: string]: Card;
        }
      | Card[]
  ): CardsReceived {
    const payload = Array.isArray(cards)
      ? keyBy(cards, ({ uuid }) => uuid)
      : cards;
    return {
      type: CARDS_RECEIVED,
      payload
    };
  }

  function copyCardImageMeta(from: string, to: string) {
    return {
      type: COPY_CARD_IMAGE_META as typeof COPY_CARD_IMAGE_META,
      payload: { from, to }
    };
  }

  function clearCards(ids: string[]): ClearCards {
    return {
      type: 'SHARED/CLEAR_CARDS',
      payload: {
        ids
      }
    };
  }

  function removeGroupCard(id: string, cardId: string): RemoveGroupCard {
    return {
      type: REMOVE_GROUP_CARD,
      payload: {
        id,
        cardId
      }
    };
  }

  function removeSupportingCard(
    id: string,
    cardId: string
  ): RemoveSupportingCard {
    return {
      type: REMOVE_SUPPORTING_CARD,
      payload: {
        id,
        cardId
      }
    };
  }

  const insertGroupCard = (
    id: string,
    index: number,
    cardId: string,
    persistTo: 'collection' | 'clipboard'
  ): InsertGroupCard => ({
    type: INSERT_GROUP_CARD,
    payload: {
      id,
      index,
      cardId
    },
    meta: {
      persistTo,
      key: 'cardId'
    }
  });

  type TArticleEntities = [Card?, ExternalArticle?];

  /**
   * Create the appropriate article entities from a MappableDropType,
   * and add them to the application state.
   */
  const createArticleEntitiesFromDrop = (
    drop: MappableDropType
  ): ThunkResult<Promise<Card | undefined>> => {
    return async (dispatch, getState) => {
      const isEdition = selectEditMode(getState()) === 'editions';
      const [maybeCard, maybeExternalArticle] = await getArticleEntitiesFromDrop(
        drop,
        isEdition,
        dispatch
      );
      if (maybeExternalArticle) {
        dispatch(externalArticleActions.fetchSuccess(maybeExternalArticle));
      }
      if (maybeCard) {
        dispatch(cardsReceived([maybeCard]));
      }
      return maybeCard;
    };
  };

  /**
   * Given a resource id, extract the appropriate entities -- an Card
   * and possibly an ExternalArticle. The resource id can be a few different things:
   *  - a article, tag or section (either the full URL or the ID)
   *  - an external link.
   */
  const getArticleEntitiesFromDrop = async (
    drop: MappableDropType,
    isEdition: boolean,
    dispatch: Dispatch
  ): Promise<TArticleEntities> => {
    if (drop.type === 'CAPI') {
      return getArticleEntitiesFromFeedDrop(drop.data, isEdition);
    }
    const droppedDataURL = drop.data.trim();
    const resourceIdOrUrl = isGoogleRedirectUrl(droppedDataURL)
      ? getRelevantURLFromGoogleRedirectURL(droppedDataURL)
      : droppedDataURL;
    const isURL = isValidURL(resourceIdOrUrl);
    const id = isURL ? getIdFromURL(resourceIdOrUrl) : resourceIdOrUrl;
    const isGuardianURLWithGuMetaData =
      isGuardianUrl(resourceIdOrUrl) &&
      hasWhitelistedParams(resourceIdOrUrl, snapMetaWhitelist);
    const isGuardianUrlWithMarketingParams =
      isGuardianUrl(resourceIdOrUrl) &&
      hasWhitelistedParams(resourceIdOrUrl, marketingParamsWhiteList);
    const guMeta = isGuardianUrl(resourceIdOrUrl)
      ? getCardMetaFromUrlParams(resourceIdOrUrl)
      : false;
    const isPlainUrl = isURL && !id && !guMeta;
    const isCAPIUrl = isCapiUrl(resourceIdOrUrl);
    if (isCAPIUrl) {
      try {
        const atom = await getAtomFromCapi(
          getAbsolutePath(resourceIdOrUrl, false)
        );
        const card = await createAtomSnap(resourceIdOrUrl, atom);
        return [card];
      } catch (e) {
        dispatch(
          startOptionsModal(
            'Invalid link',
            'It looks like you’ve tried to add something from our content-api that we don’t accept. Only interactive atoms can be added as cards. Check the link is for an interactive atom and that the link is valid and try again.',
            [],
            noop,
            true
          )
        );
        return [];
      }
    }
    if (isPlainUrl) {
      const card = await createSnap(resourceIdOrUrl);
      return [card];
    }
    try {
      // If we have gu params in the url, create a snap with the meta we extract.
      if (isGuardianURLWithGuMetaData) {
        const meta = getCardMetaFromUrlParams(resourceIdOrUrl);
        const card = await createSnap(id, meta);
        return [card];
      }
      // If it has valid marketing params, should return whole url complete with query params
      if (isGuardianUrlWithMarketingParams) {
        const card = await createSnap(resourceIdOrUrl);
        return [card];
      }

      // id check confirms id is present (meaning this is in capi), keeping code below typesafe
      if (!id) {
        return [];
      }
      const {
        articles: [article, ...rest],
        title
      } = await getContent(id);
      if (rest.length) {
        // If we have multiple articles returned from a single resource, we're
        // dealing with a tag or section page.
        const card = await getArticleEntitiesFromGuardianPath(
          resourceIdOrUrl,
          dispatch,
          title
        );
        return [card];
      }
      if (article) {
        // We have a single article from CAPI - create an item as usual.
        return [createCard(article.id, isEdition), article];
      }
    } catch (e) {
      if (isURL) {
        // If there was an error getting content for CAPI, assume the link is valid
        // and create a link snap as a fallback. This catches cases like non-tag or
        // section guardian.co.uk URLs, which aren't in CAPI and are sometimes linked.
        const card = await createSnap(resourceIdOrUrl);
        return [card];
      }
    }
    return [];
  };

  const getArticleEntitiesFromFeedDrop = (
    capiArticle: CapiArticle,
    isEdition: boolean
  ): TArticleEntities => {
    const article = transformExternalArticle(capiArticle);
    const card = createCard(
      article.id,
      isEdition,
      article.frontsMeta.defaults.imageHide,
      article.frontsMeta.defaults.imageReplace,
      article.frontsMeta.defaults.imageCutoutReplace,
      article.frontsMeta.cutout,
      article.frontsMeta.defaults.showByline,
      article.frontsMeta.defaults.showQuotedHeadline,
      article.frontsMeta.defaults.showKickerCustom,
      article.frontsMeta.pickedKicker
    );
    return [card, article];
  };

  const snapMetaWhitelist = [
    'gu-snapCss',
    'gu-snapUri',
    'gu-snapType',
    'gu-headline',
    'gu-trailText'
  ];
  const guPrefix = 'gu-';

  const marketingParamsWhiteList = ['acquisitionData', 'INTCMP'];

  const hasWhitelistedParams = (url: string, whiteList: string[]) => {
    const validParams = checkQueryParams(url, whiteList);
    return validParams && validParams.length > 0;
  };

  const checkQueryParams = (url: string, whiteList: string[]) => {
    let urlObj: URL | undefined;
    try {
      urlObj = new URL(url);
    } catch (e) {
      // This wasn't a valid URL -- we won't be able to extract values.
      return undefined;
    }
    const allParams = Array.from(urlObj.searchParams);
    return allParams.filter(([key]) => whiteList.includes(key));
  };

  /**
   * Given a URL, produce an object with the appropriate meta values.
   */
  const getCardMetaFromUrlParams = (url: string): CardMeta | undefined => {
    const guParams = checkQueryParams(url, snapMetaWhitelist);
    return (
      guParams &&
      guParams.reduce(
        (acc, [key, value]) => ({ ...acc, [key.replace(guPrefix, '')]: value }),
        {}
      )
    );
  };

  /**
   * Given a URL, identify whether it has been provided as Google redirect URL,
   * e.g. https://www.google.com/url?q=https://example.com/foobar&sa=D&source=hangouts&ust=someId&usg=anotherId
   * This can happen as a result of a URL being copied from Google Hangouts
   */
  const isGoogleRedirectUrl = (url: string) => {
    const a = document.createElement('a');
    a.href = url;
    return a.hostname.includes('google') && hasWhitelistedParams(url, ['q']);
  };

  const getRelevantURLFromGoogleRedirectURL = (url: string) => {
    const params = checkQueryParams(url, ['q']);
    if (params && isValidURL(params[0][1])) {
      return params[0][1];
    }
    return url;
  };

  const getArticleEntitiesFromGuardianPath = async (
    resourceId: string,
    dispatch: Dispatch,
    title?: string
  ): Promise<Card> =>
    new Promise((resolve, reject) => {
      dispatch(
        startOptionsModal(
          'Choose snaplink type',
          `Click "Latest from" to always display most recent content with '${title}' tag or click "Link" to just create a link to this tag page`,
          [
            {
              buttonText: 'Latest from',
              callback: () => {
                const card = createLatestSnap(
                  resourceId,
                  title || 'Unknown title'
                );
                resolve(card);
              }
            },
            {
              buttonText: 'Link',
              callback: async () => {
                const snap = await createSnap(resourceId);
                resolve(snap);
              }
            }
          ],
          reject,
          true
        )
      );
    });

  const maybeAddFrontPublicationDate = (
    cardId: string
  ): MaybeAddFrontPublicationDate => ({
    type: 'SHARED/MAYBE_ADD_FRONT_PUBLICATION',
    payload: {
      id: cardId,
      date: Date.now()
    }
  });

  export {
    updateCardMeta,
    cardsReceived,
    insertGroupCard,
    insertSupportingCard,
    removeGroupCard,
    removeSupportingCard,
    createArticleEntitiesFromDrop,
    clearCards,
    maybeAddFrontPublicationDate,
    copyCardImageMeta,
    hasWhitelistedParams,
    snapMetaWhitelist,
    marketingParamsWhiteList
  };





export {
  insertCardWithCreate,
  moveCard,
  updateCardMetaWithPersist,
  removeCard,
  addImageToCard,
  copyCardImageMetaWithPersist,
  cloneCardToTarget,
  addCardToClipboard
};
