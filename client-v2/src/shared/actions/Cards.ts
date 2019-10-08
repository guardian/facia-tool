import keyBy from 'lodash/keyBy';
import { actions as externalArticleActions } from 'shared/bundles/externalArticlesBundle';
import { getContent, transformExternalArticle } from 'services/faciaApi';
import { ThunkResult } from 'types/Store';
import {
  CardsReceived,
  InsertGroupCard,
  InsertSupportingCard,
  RemoveGroupCard,
  RemoveSupportingCard,
  UpdateCardMeta,
  ClearCards,
  MaybeAddFrontPublicationDate
} from 'shared/types/Action';
import { createCard } from 'shared/util/card';
import { createSnap, createLatestSnap } from 'shared/util/snap';
import { getIdFromURL } from 'util/CAPIUtils';
import { isValidURL, isGuardianUrl } from 'shared/util/url';
import { MappableDropType } from 'util/collectionUtils';
import { ExternalArticle } from 'shared/types/ExternalArticle';
import { CapiArticle } from 'types/Capi';
import { Card, CardMeta } from '../types/Collection';
import {selectEditMode} from "../../selectors/pathSelectors";

export const UPDATE_CARD_META = 'SHARED/UPDATE_CARD_META';
export const CARDS_RECEIVED = 'SHARED/CARDS_RECEIVED';
export const CLEAR_CARDS = 'SHARED/CLEAR_CARDS';
export const REMOVE_GROUP_CARD = 'SHARED/REMOVE_GROUP_CARD';
export const REMOVE_SUPPORTING_CARD = 'SHARED/REMOVE_SUPPORTING_CARD';
export const INSERT_GROUP_CARD = 'SHARED/INSERT_GROUP_CARD';
export const INSERT_SUPPORTING_CARD = 'SHARED/INSERT_SUPPORTING_CARD';
export const COPY_CARD_IMAGE_META = 'SHARED/COPY_CARD_IMAGE_META';

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
  cardId: string
): InsertGroupCard => ({
  type: INSERT_GROUP_CARD,
  payload: {
    id,
    index,
    cardId
  }
});

const insertSupportingCard = (
  id: string,
  index: number,
  cardId: string
): InsertSupportingCard => ({
  type: INSERT_SUPPORTING_CARD,
  payload: {
    id,
    index,
    cardId
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
    let isEdition = selectEditMode(getState()) === 'editions';
    const [maybeCard, maybeExternalArticle] = await getArticleEntitiesFromDrop(
      drop, isEdition
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
  isEdition: boolean
): Promise<TArticleEntities> => {
  if (drop.type === 'CAPI') {
    return getArticleEntitiesFromFeedDrop(drop.data, isEdition);
  }
  const resourceIdOrUrl = drop.data.trim();
  const isURL = isValidURL(resourceIdOrUrl);
  const id = isURL ? getIdFromURL(resourceIdOrUrl) : resourceIdOrUrl;
  const guMeta = isGuardianUrl(resourceIdOrUrl)
    ? getCardMetaFromUrlParams(resourceIdOrUrl)
    : false;
  const isPlainUrl = isURL && !id && !guMeta;
  if (isPlainUrl) {
    const card = await createSnap(resourceIdOrUrl);
    return [card];
  }
  try {
    if (guMeta) {
      // If we have gu params in the url, create a snap with the meta we extract.
      const card = await createSnap(id, guMeta);
      return [card];
    }
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
      return await getArticleEntitiesFromGuardianPath(resourceIdOrUrl, title);
    }
    if (article) {
      console.log(article)
      // We have a single article from CAPI - create an item as usual.
<<<<<<< HEAD:client-v2/src/shared/actions/Cards.ts
      return [createCard(article.id, isEdition), article];
=======
      return [createCard(article.id), article];
>>>>>>> master:client-v2/src/shared/actions/Cards.ts
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
  'snapCss',
  'snapUri',
  'snapType',
  'headline',
  'trailText'
];
const guPrefix = 'gu-';

/**
 * Given a URL, produce an object with the appropriate meta values.
 */
const getCardMetaFromUrlParams = (url: string): CardMeta | undefined => {
  let urlObj: URL | undefined;
  try {
    urlObj = new URL(url);
  } catch (e) {
    // This wasn't a valid URL -- we won't be able to extract values.
    return undefined;
  }
  const guParams = Array.from(urlObj.searchParams).filter(
    ([key]) =>
      true ||
      (key.indexOf(guPrefix) !== -1 &&
        snapMetaWhitelist.indexOf(key.replace(guPrefix, '')) !== -1)
  );
  return guParams.length
    ? guParams.reduce(
        (acc, [key, value]) => ({ ...acc, [key.replace('gu-', '')]: value }),
        {}
      )
    : undefined;
};

const getArticleEntitiesFromGuardianPath = async (
  resourceId: string,
  title?: string
): Promise<TArticleEntities> => {
  const createLatest = window.confirm(
    "Should this snap be a 'Latest' snap? \n \n Click OK to confirm or cancel to create a 'Link' snap by default."
  );
  const card = await (createLatest
    ? createLatestSnap(resourceId, title || 'Unknown title')
    : createSnap(resourceId));
  return [card];
};

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
  copyCardImageMeta
};
