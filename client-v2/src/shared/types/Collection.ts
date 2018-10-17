import { Diff } from 'utility-types';

interface Group {
  id: string;
  uuid: string;
  articleFragments: string[];
}

type Stages = 'draft' | 'live' | 'previously';

interface NestedArticleFragmentRootFields {
  id: string;
  frontPublicationDate: number;
  publishedBy?: string;
}

type NestedArticleFragment = NestedArticleFragmentRootFields & {
  meta: {
    supporting?: Array<Diff<NestedArticleFragment, { supporting: unknown }>>;
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
  meta: ArticleFragmentMeta
};

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
}

export {
  NestedArticleFragment,
  ArticleFragment,
  ArticleFragmentDenormalised,
  ArticleFragmentRootFields,
  ArticleFragmentMeta,
  CollectionWithNestedArticles,
  CollectionResponse,
  Collection,
  Group,
  Stages
};
