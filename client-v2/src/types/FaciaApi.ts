import { PriorityName } from './Priority';
import { $Diff } from 'utility-types';
import { CollectionWithNestedArticles } from 'shared/types/Collection';

interface FrontConfigResponse {
  collections: string[];
  priority?: PriorityName;
  canonical?: string;
  group?: string;
  isHidden?: boolean;
  isImageDisplayed?: boolean;
  imageHeight?: number;
  imageWidth?: number;
  imageUrl?: string;
  onPageDescription?: string;
  description?: string;
  title?: string;
  webTitle?: string;
  navSection?: string;
}

type Platform = 'Web' | 'Platform';

interface FrontsToolSettings {
  displayEditWarning?: boolean;
}

interface CollectionConfigResponse {
  displayName: string;
  type: string;
  backfill?: unknown;
  href?: string;
  groups?: string[];
  metadata?: Array<unknown>;
  uneditable?: boolean;
  showTags?: boolean;
  hideKickers?: boolean;
  excludedFromRss?: boolean;
  description?: string;
  showSections?: boolean;
  showDateHeader?: boolean;
  showLatestUpdate?: boolean;
  excludeFromRss?: boolean;
  hideShowMore?: boolean;
  platform?: Platform;
  frontsToolSettings?: FrontsToolSettings;
}

interface FrontsConfigResponse {
  fronts: {
    [id: string]: FrontConfigResponse;
  };
  collections: {
    [id: string]: CollectionConfigResponse;
  };
}

type FrontConfig = $Diff<
  FrontConfigResponse,
  { priority?: PriorityName | void }
> & {
  id: string;
  priority: PriorityName;
};

type CollectionConfig = CollectionConfigResponse & {
  id: string;
};

interface FrontConfigMap {
  [id: string]: FrontConfig;
}

interface CollectionConfigMap {
  [id: string]: CollectionConfig;
}

interface FrontsConfig {
  fronts: FrontConfigMap;
  collections: CollectionConfigMap;
}

interface ArticleDetails {
  group: number;
  isBoosted: boolean;
}

interface CollectionResponse {
  collection: CollectionWithNestedArticles;
  storiesVisibleByStage: {
    live: VisibleArticlesResponse;
    draft: VisibleArticlesResponse;
  };
}

interface VisibleArticlesResponse {
  desktop: number;
  mobile: number;
}

export {
  FrontConfig,
  CollectionConfig,
  FrontsConfig,
  FrontsConfigResponse,
  FrontConfigMap,
  CollectionConfigMap,
  ArticleDetails,
  CollectionResponse,
  VisibleArticlesResponse,
  FrontsToolSettings
};
