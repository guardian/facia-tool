import { Diff } from 'utility-types';

type Group = {
  id: string;
  uuid: string;
  articleFragments: string[];
};

type Stages = 'draft' | 'live' | 'previously';

type NestedArticleFragmentRootFields = {
  id: string;
  frontPublicationDate: number;
  publishedBy?: string;
};

type NestedArticleFragment = NestedArticleFragmentRootFields & {
  meta: {
    supporting?: Diff<NestedArticleFragment, { supporting: unknown }>[];
  };
};

type ArticleFragmentRootMeta = {
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
  slideshow?: {
    src?: string;
    thumb?: string;
    width?: string;
    height?: string;
    origin?: string;
  }[];
};

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

type CollectionResponse = {
  live: NestedArticleFragment[];
  draft?: NestedArticleFragment[];
  previously?: NestedArticleFragment[];
  lastUpdated?: number;
  updatedBy?: string;
  updatedEmail?: string;
  platform?: string;
  displayName: string;
  groups?: Array<string>;
};

type CollectionWithNestedArticles = CollectionResponse & {
  id: string;
};

type Collection = {
  live?: string[];
  previously?: string[];
  draft?: string[];
  id: string;
  lastUpdated?: number;
  updatedBy?: string;
  updatedEmail?: string;
  platform?: string;
  displayName: string;
  groups?: Array<string>;
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
  Group,
  Stages
};
