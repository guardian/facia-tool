type EditionsArticle = any;

interface EditionsCollection {
  id: string;
  name: string;
  prefill: string;
  isHidden: boolean;
  updatedOn?: number;
  updatedBy?: string;
  updatedEmail?: string;
  live: EditionsArticle[];
  draft: EditionsArticle[];
}

interface EditionsFront {
  id: string;
  name: string;
  isHidden: boolean;
  updatedOn?: number;
  updatedBy?: string;
  updatedEmail?: string;
  collections: EditionsCollection[];
}

interface EditionsIssue {
  id: string;
  name: string;
  publishDate: string; // the date for which edition is made for, in format TimestampZ, eg 2016-06-22 19:10:25-07
  lastPublished: string; // null if not published
  createdOn: string;
  createdBy: string;
  createdEmail: string;
  fronts: EditionsFront[];
}

export { EditionsIssue, EditionsFront, EditionsCollection, EditionsArticle };
