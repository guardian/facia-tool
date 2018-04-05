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

type CollectionDetail = {
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

type Collection = {
  [string]: CollectionDetail
};

type FrontsConfig = {
  fronts: Front,
  collections: Collection
};

type Priorities = {
  editorial: Object,
  commercial: Object,
  training: Object,
  email: Object
};

export type {
  FrontsConfig,
  FrontConfig,
  Front,
  FrontDetail,
  Collection,
  CollectionDetail,
  Priorities,
  PriorityName
};
