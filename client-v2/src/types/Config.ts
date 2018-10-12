
//
import type { NestedArticleFragment } from 'shared/types/Collection';

type Permission = {
  [string]: boolean
};

type Acl = {
  fronts: Permission,
  permissions: Permission
};

type Metadata = {
  type: String
};

type Config = {
  dev: boolean,
  env: string,
  editions: Array<string>,
  email: string,
  avararUrl?: string,
  firstName: string,
  lastName: string,
  sentryPublicDSN: string,
  mediaBaseUrl: string,
  apiBaseUrl: string,
  stage: string,
  switches: Object,
  acl: Acl,
  collectionCap: number,
  navListCap: number,
  navListType: string,
  collectionMetadata: Array<Metadata>,
  capiLiveUrl: string,
  capiPreviewUrl: string,
  ravenUrl?: string,
  frontIds: Array<string>,
  clipboardArticles: Array<NestedArticleFragment>
};

export type { Config };
