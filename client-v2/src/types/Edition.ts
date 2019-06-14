type EditionsArticle = any;

interface EditionsCollection {
  id: string;
  displayName: string;
  prefill?: string;
  isHidden: boolean;
  lastUpdated?: string;
  updatedBy?: string;
  updatedEmail?: string;
  live: EditionsArticle[];
  draft: EditionsArticle[];
}

interface EditionsFront {
  id: string;
  displayName: string;
  isHidden: boolean;
  updatedOn?: number;
  updatedBy?: string;
  updatedEmail?: string;
  collections: EditionsCollection[];
}

interface EditionsIssue {
  id: string;
  displayName: string;
  issueDate: string; // the date for which edition is made for, in format TimestampZ, eg 2016-06-22 19:10:25-07
  lastPublished: string; // null if not published
  launchedOn: string;
  launchedBy: string;
  launchedEmail: string;
  fronts: EditionsFront[];
}

export { EditionsIssue, EditionsFront, EditionsCollection, EditionsArticle };
