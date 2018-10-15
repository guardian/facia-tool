import { PriorityName } from './Priority';
import { $Diff } from 'utility-types';

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
    [id: string]: FrontConfigResponse
  },
  collections: {
    [id: string]: CollectionConfigResponse
  }
};

type FrontConfig = $Diff<
  FrontConfigResponse,
  { priority?: PriorityName | void }
> & {
  id: string,
  priority: PriorityName
};

type CollectionConfig = CollectionConfigResponse & {
  id: string
};

type FrontConfigMap = {
  [id: string]: FrontConfig
};

type CollectionConfigMap = {
  [id: string]: CollectionConfig
};

type FrontsConfig = {
  fronts: FrontConfigMap,
  collections: CollectionConfigMap
};

export {
  FrontConfig,
  CollectionConfig,
  FrontsConfig,
  FrontsConfigResponse,
  FrontConfigMap
};
