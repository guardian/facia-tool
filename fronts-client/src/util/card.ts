import v4 from 'uuid/v4';
import { Card, CardMeta } from 'types/Collection';
import pick from 'lodash/pick';
import cloneDeep from 'lodash/cloneDeep';
import { startOptionsModal } from 'actions/OptionsModal';
import noop from 'lodash/noop';
import {
  getAtomFromCapi,
  getContent,
  transformExternalArticle,
} from 'services/faciaApi';
import { CapiArticle } from 'types/Capi';
import { TArticleEntities } from 'types/Cards';
import { Dispatch } from 'types/Store';
import { getIdFromURL } from 'util/CAPIUtils';
import { MappableDropType } from 'util/collectionUtils';
import {
  createAtomSnap,
  createLatestSnap,
  createPlainSnap,
  createSnap,
} from 'util/snap';
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

// Ideally we will convert this to a type. See
// https://trello.com/c/wIMDut8V/138-add-a-type-to-the-createcard-function-in-src-shared-util-cardts
const createCard = (
  id: string,
  isEdition: boolean,
  imageHide: boolean = false,
  imageReplace: boolean = false,
  imageCutoutReplace: boolean = false,
  imageCutoutSrc?: string,
  showByline: boolean = false,
  showQuotedHeadline: boolean = false,
  showKickerCustom: boolean = false,
  customKicker: string = ''
) => ({
  uuid: v4(),
  id,
  frontPublicationDate: Date.now(),
  meta: {
    ...(imageHide ? { imageHide } : {}),
    ...(imageReplace ? { imageReplace } : {}),
    ...(imageCutoutReplace ? { imageCutoutReplace, imageCutoutSrc } : {}),
    ...(showByline ? { showByline } : {}),
    ...(showQuotedHeadline ? { showQuotedHeadline } : {}),
    ...(isEdition || showKickerCustom ? { showKickerCustom: true } : {}),
    ...(isEdition || showKickerCustom ? { customKicker } : {}),
  },
});

// only go one deep
const cloneCard = (
  card: Card,
  cards: { [id: string]: Card } // all the cards to enable nested rebuilds
): { parent: Card; supporting: Card[] } => {
  const sup = (card.meta.supporting || [])
    .map((id) => {
      const supportingCard = cards[id];
      const { supporting, ...meta } = supportingCard.meta;
      return cloneCard(
        {
          ...supportingCard,
          meta,
        },
        cards
      ).parent;
    })
    .filter((s: Card): s is Card => !!s);

  return {
    parent: {
      ...card,
      uuid: v4(),
      meta: {
        ...card.meta,
        supporting: sup.map(({ uuid }) => uuid),
      },
    },
    supporting: sup,
  };
};

const cloneActiveImageMeta = ({ meta }: Card): CardMeta => {
  const newMeta: CardMeta = {
    imageCutoutReplace: false,
    imageSlideshowReplace: false,
    imageReplace: false,
  };
  if (meta.imageReplace) {
    return {
      ...newMeta,
      ...pick(meta, [
        'imageSrc',
        'imageSrcThumb',
        'imageSrcWidth',
        'imageSrcHeight',
        'imageSrcOrigin',
      ]),
      imageReplace: true,
    };
  }
  if (meta.imageSlideshowReplace) {
    return {
      ...newMeta,
      slideshow: cloneDeep(meta.slideshow),
      imageSlideshowReplace: true,
    };
  }
  if (meta.imageCutoutReplace) {
    return {
      ...newMeta,
      ...pick(meta, [
        'imageCutoutSrc',
        'imageCutoutSrcWidth',
        'imageCutoutSrcHeight',
        'imageCutoutSrcOrigin',
      ]),
      imageCutoutReplace: true,
    };
  }
  return {};
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
  try {
    if (isPlainUrl) {
      const card = await createPlainSnap(resourceIdOrUrl);
      return [card];
    }
  } catch (e) {
    dispatch(
      startOptionsModal(
        'Could not create snap link',
        `We couldn't create a snap link with that URL. The error was: \n\n${e.message}`,
        [],
        noop
      )
    );
    return [];
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

export {
  createCard,
  cloneCard,
  cloneActiveImageMeta,
  getArticleEntitiesFromDrop,
  snapMetaWhitelist,
  marketingParamsWhiteList,
};
