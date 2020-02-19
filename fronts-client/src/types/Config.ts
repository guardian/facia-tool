import { NestedCard } from 'types/Collection';
import { FeatureSwitch } from './Features';

interface Permission {
  [id: string]: boolean;
}

interface Acl {
  fronts: Permission;
  permissions: Permission;
}

interface Metadata {
  type: string;
}

interface Config {
  dev: boolean;
  env: string;
  editions: string[];
  email: string;
  avararUrl?: string;
  firstName: string;
  lastName: string;
  sentryPublicDSN: string;
  mediaBaseUrl: string;
  apiBaseUrl: string;
  switches: { [key: string]: boolean };
  stage: string;
  acl: Acl;
  collectionCap: number;
  navListCap: number;
  navListType: string;
  collectionMetadata: Metadata[];
  capiLiveUrl: string;
  capiPreviewUrl: string;
  // frontIds is deprecated -- use frontIdsByPriority.
  userData?: {
    frontIds: string[];
    frontIdsByPriority: {
      [id: string]: string[];
    };
    favouriteFrontIdsByPriority: {
      [id: string]: string[];
    };
    clipboardArticles: NestedCard[];
    featureSwitches: FeatureSwitch[];
  };
}

export { Config };
