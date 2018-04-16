// @flow

type PriorityName = 'editorial' | 'commercial' | 'training' | 'email';

type FrontConfig = {
  collections: Array<string>,
  priority?: PriorityName,
  canonical?: string,
  group?: string,
  isHidden?: boolean,
  isImageDisplayed?: boolean,
  imageHeight?: number,
  imageWidth?: number,
  imageUrl?: string,
  onPageDescription?: string,
  description?: string,
  title?: string,
  webTitle?: string,
  navSection?: string
};

type FrontDetail = FrontConfig & { id: string };

type Front = {
  [string]: FrontConfig
};

type Platform = 'Web' | 'Platform';

type ConfigCollectionDetail = {
  displayName: string,
  type: string,
  backfill?: Object,
  href?: string,
  groups?: Array<string>,
  metadata?: Array<Object>,
  platform?: string,
  uneditable?: boolean,
  showTags?: boolean,
  hideKickers?: boolean,
  excludedFromRss?: boolean,
  description?: string,
  showSections?: boolean,
  showDateHeader?: boolean,
  showLatestUpdate?: boolean,
  excludeFromRss?: boolean,
  hideShowMore?: boolean,
  platform?: Platform
};

type ConfigCollectionDetailWithId = ConfigCollectionDetail & { id: string };

type ConfigCollection = {
  [string]: ConfigCollectionDetail
};

type FrontsConfig = {
  fronts: Front,
  collections: ConfigCollection
};

type FrontsClientConfig = {
  fronts: Array<FrontDetail>,
  collections: ConfigCollection
};

type Priorities = {
  editorial: Object,
  commercial: Object,
  training: Object,
  email: Object
};

// TODO
type Meta = Object;

type Article = {
  id: string,
  frontPublicationDate: number,
  publishedBy: string,
  meta: Meta
};

type FrontCollectionDetail = {
  draft: Array<Article>,
  live: Array<Article>,
  previously: Array<Article>,
  lastUpdated: number,
  updatedBy: string,
  updatedEmail: string
};

type CapiArticle = {
  headline: string
};

export type {
  FrontsConfig,
  FrontConfig,
  Front,
  FrontDetail,
  ConfigCollection,
  ConfigCollectionDetail,
  ConfigCollectionDetailWithId,
  Priorities,
  PriorityName,
  FrontsClientConfig,
  FrontCollectionDetail,
  Article,
  CapiArticle
};
