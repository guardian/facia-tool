

import type { PriorityName } from './Priority';

type FrontConfigResponse = {
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

type Platform = 'Web' | 'Platform';

type CollectionConfigResponse = {
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

type FrontsConfigResponse = {
  fronts: {
    [string]: FrontConfigResponse
  },
  collections: {
    [string]: CollectionConfigResponse
  }
};

type FrontConfig = $Diff<
  FrontConfigResponse,
  { priority: PriorityName | void }
> & {
  id: string,
  priority: PriorityName
};

type CollectionConfig = CollectionConfigResponse & {
  id: string
};

type FrontConfigMap = {
  [string]: FrontConfig
};

type CollectionConfigMap = {
  [string]: CollectionConfig
};

type FrontsConfig = {
  fronts: FrontConfigMap,
  collections: CollectionConfigMap
};

export type {
  FrontConfig,
  CollectionConfig,
  FrontsConfig,
  FrontsConfigResponse,
  FrontConfigMap
};
