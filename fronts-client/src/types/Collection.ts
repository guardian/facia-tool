import { CapiArticle } from 'types/Capi';
import { Diff } from 'utility-types';
import type { FrontsToolSettings } from 'types/FaciaApi';
import { CardTypes } from 'constants/cardTypes';

interface CollectionArticles {
  draft: CapiArticle[];
  live: CapiArticle[];
}

interface AlsoOnDetail {
  priorities: string[];
  fronts: Array<{ id: string; priority: string }>;
  meritsWarning: boolean;
}

interface Group {
  id: string | null;
  name: string | null;
  uuid: string;
  cards: string[];
}

// CardSets represent all of the lists of cards available in a collection.
type CardSets = 'draft' | 'live' | 'previously';
// Stages represent only those lists which are curated by the user.
type Stages = 'draft' | 'live';
type CardSizes = 'wide' | 'default' | 'medium' | 'small';

interface NestedCardRootFields {
  id: string;
  cardType?: CardTypes;
  frontPublicationDate: number;
  publishedBy?: string;
}

type NestedCard = NestedCardRootFields & {
  meta: {
    supporting?: Array<Diff<NestedCard, { supporting: unknown }>>;
    group?: string | null;
  };
};

interface CardRootMeta {
  group?: string;
  headline?: string;
  trailText?: string;
  byline?: string;
  sportScore?: string;
  customKicker?: string;
  href?: string;
  imageSrc?: string;
  imageSrcThumb?: string;
  imageSrcWidth?: string;
  imageSrcHeight?: string;
  imageSrcOrigin?: string;
  imageCutoutSrc?: string;
  imageCutoutSrcWidth?: string;
  imageCutoutSrcHeight?: string;
  imageCutoutSrcOrigin?: string;
  isBreaking?: boolean;
  isBoosted?: boolean;
  showLivePlayable?: boolean;
  showMainVideo?: boolean;
  showLargeHeadline?: boolean;
  showQuotedHeadline?: boolean;
  showByline?: boolean;
  imageCutoutReplace?: boolean;
  imageReplace?: boolean;
  imageHide?: boolean;
  showKickerTag?: boolean;
  showKickerSection?: boolean;
  showKickerCustom?: boolean;
  snapUri?: string;
  snapType?: string;
  snapCss?: string;
  atomId?: string;
  imageSlideshowReplace?: boolean;
  slideshow?: Array<{
    src?: string;
    thumb?: string;
    width?: string;
    height?: string;
    origin?: string;
  }>;
  overrideArticleMainMedia?: boolean;
  coverCardImageReplace?: boolean;
  coverCardMobileImage?: ImageData;
  coverCardTabletImage?: ImageData;
  bio?: string;
}

type CardRootFields = NestedCardRootFields & {
  uuid: string;
};

type CardMeta = CardRootMeta & {
  supporting?: string[];
};

type ChefCardMeta = {
  bio: string;
};

interface Card extends CardRootFields {
  meta: CardMeta;
}

interface CardMetaDenormalised extends CardRootMeta {
  supporting?: CardDenormalised[];
}

interface CardDenormalised extends CardRootFields {
  meta: CardMetaDenormalised;
}

interface CollectionFromResponse {
  live: NestedCard[];
  previously?: NestedCard[];
  draft?: NestedCard[];
  isHidden?: boolean;
  lastUpdated?: number;
  updatedBy?: string;
  updatedEmail?: string;
  platform?: string;
  displayName: string;
  groups?: string[];
  metadata?: Array<{ type: string }>;
  uneditable?: boolean;
  targetedTerritory?: string;
}

type CollectionWithNestedArticles = CollectionFromResponse & {
  id: string;
};

// previouslyCardIds is stored in a separate key to avoid losing ordering information during normalisation.
interface Collection {
  live?: string[];
  previously?: string[];
  previouslyCardIds?: string[]; // this contains ids for deleted articles on a collection
  draft?: string[];
  id: string;
  lastUpdated?: number;
  updatedBy?: string;
  updatedEmail?: string;
  platform?: string;
  displayName: string;
  groups?: string[];
  metadata?: Array<{ type: string }>;
  uneditable?: boolean;
  type?: string;
  frontsToolSettings?: FrontsToolSettings;
  isHidden?: boolean;
  targetedTerritory?: string;
}

interface ArticleTag {
  webTitle?: string;
  sectionName?: string;
}

export {
  CollectionArticles,
  AlsoOnDetail,
  NestedCard,
  Card,
  CardDenormalised,
  CardRootFields,
  CardMeta,
  CollectionWithNestedArticles,
  CollectionFromResponse,
  Collection,
  CardSizes,
  Group,
  Stages,
  CardSets,
  ArticleTag,
  ChefCardMeta,
};
