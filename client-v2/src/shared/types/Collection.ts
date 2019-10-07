import { Diff } from 'utility-types';
import { FrontsToolSettings } from 'types/FaciaApi';

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

type CardTypes = 'SNAP_LINK' | 'ARTICLE';
type CardSizes = 'wide' | 'default' | 'medium' | 'small';

interface NestedCardRootFields {
  id: string;
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
}

type CardRootFields = NestedCardRootFields & {
  uuid: string;
};

type CardMeta = CardRootMeta & {
  supporting?: string[];
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
  type: string;
  frontsToolSettings?: FrontsToolSettings;
  isHidden?: boolean;
}

interface ArticleTag {
  webTitle?: string;
  sectionName?: string;
}

export {
  NestedCard,
  Card,
  CardDenormalised,
  CardRootFields,
  CardMeta,
  CollectionWithNestedArticles,
  CollectionFromResponse,
  Collection,
  CardTypes,
  CardSizes,
  Group,
  Stages,
  CardSets,
  ArticleTag
};
