type EditionsArticle = any;

interface EditionsCollection {
  id: string;
  displayName: string;
  prefill?: string;
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
  issueDate: number; // midnight on the expect publish date
  createdOn: number;
  createdBy: number;
  launchedOn?: number;
  launchedBy: string;
  launchedEmail: string;
  fronts: EditionsFront[];
}

export { EditionsIssue, EditionsFront, EditionsCollection, EditionsArticle };
