import { startOptionsModal } from 'actions/OptionsModal';
import { actions as externalArticleActions } from 'bundles/externalArticlesBundle';
import keyBy from 'lodash/keyBy';
import noop from 'lodash/noop';
import {
  getAtomFromCapi,
  getContent,
  transformExternalArticle,
} from 'services/faciaApi';
import {
  CardsReceived,
  ClearCards,
  InsertGroupCard,
  InsertSupportingCard,
  MaybeAddFrontPublicationDate,
  RemoveGroupCard,
  RemoveSupportingCard,
  UpdateCardMeta,
} from 'types/Action';
import { CapiArticle } from 'types/Capi';
import { TArticleEntities } from 'types/Cards';
import { Dispatch, ThunkResult } from 'types/Store';
import { getIdFromURL } from 'util/CAPIUtils';
import { createCard } from 'util/card';
import { MappableDropType } from 'util/collectionUtils';
import { createAtomSnap, createLatestSnap, createSnap } from 'util/snap';
import {
  checkQueryParams,
  getAbsolutePath,
  getRelevantURLFromGoogleRedirectURL,
  hasWhitelistedParams,
  isCapiUrl,
  isGoogleRedirectUrl,
  isGuardianUrl,
  isValidURL,
} from 'util/url';

import { selectEditMode } from '../selectors/pathSelectors';
import { Card, CardMeta } from '../types/Collection';

export const UPDATE_CARD_META = 'UPDATE_CARD_META';
export const CARDS_RECEIVED = 'CARDS_RECEIVED';
export const CLEAR_CARDS = 'CLEAR_CARDS';
export const REMOVE_GROUP_CARD = 'REMOVE_GROUP_CARD';
export const REMOVE_SUPPORTING_CARD = 'REMOVE_SUPPORTING_CARD';
export const INSERT_GROUP_CARD = 'INSERT_GROUP_CARD';
export const INSERT_SUPPORTING_CARD = 'INSERT_SUPPORTING_CARD';
export const COPY_CARD_IMAGE_META = 'COPY_CARD_IMAGE_META';

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
      merge,
    },
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
    payload,
  };
}

function copyCardImageMeta(from: string, to: string) {
  return {
    type: COPY_CARD_IMAGE_META as typeof COPY_CARD_IMAGE_META,
    payload: { from, to },
  };
}

function clearCards(ids: string[]): ClearCards {
  return {
    type: 'CLEAR_CARDS',
    payload: {
      ids,
    },
  };
}

function removeGroupCard(id: string, cardId: string): RemoveGroupCard {
  return {
    type: REMOVE_GROUP_CARD,
    payload: {
      id,
      cardId,
    },
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
      cardId,
    },
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
    cardId,
  },
  meta: {
    persistTo,
    key: 'cardId',
  },
});

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
    cardId,
  },
  meta: {
    persistTo,
    key: 'cardId',
  },
});

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
      title,
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
  'gu-trailText',
];
const guPrefix = 'gu-';

const marketingParamsWhiteList = ['acquisitionData', 'INTCMP'];

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
            },
          },
          {
            buttonText: 'Link',
            callback: async () => {
              const snap = await createSnap(resourceId);
              resolve(snap);
            },
          },
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
    date: Date.now(),
  },
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
  snapMetaWhitelist,
  marketingParamsWhiteList,
};
