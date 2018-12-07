import { Diff } from 'utility-types';
import { FrontsToolSettings } from 'types/FaciaApi';

interface Group {
  id: string;
  name: string | null;
  uuid: string;
  articleFragments: string[];
}

type Stages = 'draft' | 'live';
type CollectionItemSets = 'draft' | 'live' | 'previously';

type CollectionItemTypes = 'SNAP_LINK' | 'ARTICLE';
type CollectionItemDisplayTypes = 'default' | 'polaroid';
type CollectionItemSizes = 'default' | 'small';

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
  showBoostedHeadline?: boolean;
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

interface CollectionResponse {
  live: NestedArticleFragment[];
  draft?: NestedArticleFragment[];
  previously?: NestedArticleFragment[];
  lastUpdated?: number;
  updatedBy?: string;
  updatedEmail?: string;
  platform?: string;
  displayName: string;
  groups?: string[];
}

type CollectionWithNestedArticles = CollectionResponse & {
  id: string;
};

interface Collection {
  live?: string[];
  previously?: string[];
  draft?: string[];
  id: string;
  lastUpdated?: number;
  updatedBy?: string;
  updatedEmail?: string;
  platform?: string;
  displayName: string;
  groups?: string[];
  type: string
  frontsToolSettings?: FrontsToolSettings;
}

interface ArticleTag {
  webTitle?: string
  sectionName?: string
};


export {
  NestedArticleFragment,
  ArticleFragment,
  ArticleFragmentDenormalised,
  ArticleFragmentRootFields,
  ArticleFragmentMeta,
  CollectionWithNestedArticles,
  CollectionResponse,
  Collection,
  CollectionItemTypes,
  CollectionItemDisplayTypes,
  CollectionItemSizes,
  Group,
  Stages,
  CollectionItemSets,
  ArticleTag
};
