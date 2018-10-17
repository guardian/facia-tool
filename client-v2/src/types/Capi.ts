interface ImageAsset {
  type: 'image';
  mimeType: string;
  file: string;
  typeData: {
    width: string;
    number: string;
  };
}

interface ImageElement {
  id: string;
  relation: string;
  type: 'image';
  assets: ImageAsset[];
}

type Element = ImageElement;

type CapiDate = string;

interface User {
  email: string;
  firstName?: string;
  lastName?: string;
}

interface Block {
  id: string;
  bodyHtml: string;
  bodyTextSummary: string;
  title?: string;
  attributes: any[];
  published: boolean;
  createdDate?: CapiDate;
  firstPublishedDate?: CapiDate;
  publishedDate?: CapiDate;
  lastModifiedDate?: CapiDate;
  contributors: string[];
  createdBy?: User;
  lastModifiedBy?: User;
  elements: Element[];
}

interface Blocks {
  main: Block;
  body: Block[];
}

interface Tag {
  id: string;
  type: string;
  webTitle: string;
  webUrl: string;
  bylineImageUrl?: string;
  bylineLargeImageUrl?: string;
}

interface CapiArticleFields {
  headline: string;
  standfirst: string;
  trailText: string;
  byline: string;
  internalPageCode: number;
  isLive: boolean;
  firstPublicationDate: CapiDate;
  scheduledPublicationDate: CapiDate;
  secureThumbnail: string;
  thumbnail: string | void;
  liveBloggingNow: boolean;
  shortUrl: string;
  membershipUrl: string;
}

// See https://github.com/guardian/content-api-models/blob/master/models/src/main/thrift/content/v1.thrift#L1431
// for the canonical thrift definition.
interface CapiArticle {
  id: string;
  webTitle: string;
  webUrl: string;
  urlPath: string;
  webPublicationDate?: string;
  elements: Element[];
  pillarId: string;
  pillarName: string;
  sectionId: string;
  sectionName: string;
  fields: CapiArticleFields;
  frontsMeta: {
    tone: string;
  };
  tags?: Tag[];
  blocks: Blocks;
}

type CapiArticleWithMetadata = CapiArticle & { group?: number };

export {
  CapiArticle,
  CapiArticleFields,
  CapiArticleWithMetadata,
  Tag,
  Element
};
