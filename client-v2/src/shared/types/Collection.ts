import { Diff } from 'utility-types';
import { FrontsToolSettings } from 'types/FaciaApi';

interface Group {
  id: string | null;
  name: string | null;
  uuid: string;
  articleFragments: string[];
}

// CollectionItemSets represent all of the lists of collectionItems available in a collection.
type CollectionItemSets = 'draft' | 'live' | 'previously';
// Stages represent only those lists which are curated by the user.
type Stages = 'draft' | 'live';

type CollectionItemTypes = 'SNAP_LINK' | 'ARTICLE';
type CollectionItemSizes = 'wide' | 'default' | 'medium' | 'small';

interface NestedArticleFragmentRootFields {
  id: string;
  frontPublicationDate: number;
  publishedBy?: string;
}

type NestedArticleFragment = NestedArticleFragmentRootFields & {
  meta: {
    supporting?: Array<Diff<NestedArticleFragment, { supporting: unknown }>>;
    group?: string | null;
  };
};

interface ArticleFragmentRootMeta {
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

type ArticleFragmentRootFields = NestedArticleFragmentRootFields & {
  uuid: string;
};

type ArticleFragmentMeta = ArticleFragmentRootMeta & {
  supporting?: string[];
};

interface ArticleFragment extends ArticleFragmentRootFields {
  meta: ArticleFragmentMeta;
}

interface ArticleFragmentMetaDenormalised extends ArticleFragmentRootMeta {
  supporting?: ArticleFragmentDenormalised[];
}

interface ArticleFragmentDenormalised extends ArticleFragmentRootFields {
  meta: ArticleFragmentMetaDenormalised;
}

interface CollectionFromResponse {
  live: NestedArticleFragment[];
  previously?: NestedArticleFragment[];
  draft?: NestedArticleFragment[];
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

// previouslyArticleFragmentIds is stored in a separate key to avoid losing ordering information during normalisation.
interface Collection {
  live?: string[];
  previously?: string[];
  previouslyArticleFragmentIds?: string[]; // this contains ids for deleted articles on a collection
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
  NestedArticleFragment,
  ArticleFragment,
  ArticleFragmentDenormalised,
  ArticleFragmentRootFields,
  ArticleFragmentMeta,
  CollectionWithNestedArticles,
  CollectionFromResponse,
  Collection,
  CollectionItemTypes,
  CollectionItemSizes,
  Group,
  Stages,
  CollectionItemSets,
  ArticleTag
};
