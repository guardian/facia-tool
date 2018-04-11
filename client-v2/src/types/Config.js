// @flow

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
  sentryPublicDSN: string,
  mediaBaseUrl: string,
  apiBaseUrl: string,
  switches: Object,
  acl: Acl,
  collectionCap: number,
  navListCap: number,
  navListType: string,
  collectionMetadata: Array<Metadata>,
  capiLiveUrl: string,
  capiPreviewUrl: string,
  ravenUrl?: string
};

export type { Config };
