import { $Diff } from 'utility-types';
import {
  CollectionFromResponse,
  NestedArticleFragment
} from 'shared/types/Collection';

interface FrontConfigResponse {
  collections: string[];
  priority?: string;
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

type FrontConfig = $Diff<FrontConfigResponse, { priority?: string | void }> & {
  id: string;
  priority: string;
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
  id: string;
  collection: CollectionFromResponse;
  storiesVisibleByStage: {
    live: VisibleArticlesResponse;
    draft: VisibleArticlesResponse;
  };
}

interface EditionCollectionFromResponse {
  items: NestedArticleFragment[];
  lastUpdated?: number;
  updatedBy?: string;
  updatedEmail?: string;
  platform?: string;
  displayName: string;
  groups?: string[];
  metadata?: Array<{ type: string }>;
  uneditable?: boolean;
}

interface EditionCollectionResponse {
  id: string;
  collection: EditionCollectionFromResponse;
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
  EditionCollectionResponse,
  VisibleArticlesResponse,
  FrontsToolSettings
};
