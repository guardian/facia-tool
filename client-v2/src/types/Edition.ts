type EditionsArticle = any;

interface EditionsPrefill {
  queryString: string;
}

interface EditionsCollection {
  id: string;
  displayName: string;
  prefill?: EditionsPrefill;
  isHidden: boolean;
  lastUpdated?: number;
  updatedBy?: string;
  updatedEmail?: string;
  items: EditionsArticle[];
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
  issueDate: string; // YYYY-MM-dd
  createdOn: number;
  createdBy: string;
  createdEmail: string;
  launchedOn?: number;
  launchedBy: string;
  launchedEmail: string;
  fronts: EditionsFront[];
}

export {
  EditionsIssue,
  EditionsFront,
  EditionsCollection,
  EditionsArticle,
  EditionsPrefill
};
