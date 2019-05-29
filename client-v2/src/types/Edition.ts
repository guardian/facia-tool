export interface EditionIssue {
  id: string;
  name: string;
  publishDate: string; // the date for which edition is made for, in format TimestampZ, eg 2016-06-22 19:10:25-07
  lastPublished: string; // null if not published
  createdOn: string;
  createdBy: string;
  createdEmail: string;
}
