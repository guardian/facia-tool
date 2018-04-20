// @flow

import { getCollectionArticleQueryString } from '../collectionUtils';
import { frontStages } from '../../constants/fronts';

const liveArticle = {
  id: frontStages.live,
  frontPublicationDate: 1,
  publishedBy: 'Computers',
  meta: {}
};

const draftArticle = {
  id: frontStages.draft,
  frontPublicationDate: 1,
  publishedBy: 'Computers',
  meta: {}
};

const snapArticle = {
  id: 'snap/link',
  frontPublicationDate: 1,
  publishedBy: 'Computers',
  meta: {}
};

const collectionWithNoDraftArticles = {
  live: [liveArticle],
  lastUpdated: 1,
  updatedBy: 'computer',
  updatedEmail: 'email'
};

const collectionWithArticles = {
  live: [liveArticle],
  draft: [draftArticle],
  lastUpdated: 1,
  updatedBy: 'computer',
  updatedEmail: 'email'
};

const collectionWithSnapArticles = {
  live: [liveArticle],
  draft: [draftArticle, snapArticle],
  lastUpdated: 1,
  updatedBy: 'computer',
  updatedEmail: 'email'
};

describe('getCollectionArticleQueryString', () => {
  it('returns draft article ids', () => {
    expect(
      getCollectionArticleQueryString(collectionWithArticles, frontStages.draft)
    ).toBe(frontStages.draft);
  });
  it('returns live article ids if draft is missing', () => {
    expect(
      getCollectionArticleQueryString(
        collectionWithNoDraftArticles,
        frontStages.draft
      )
    ).toBe(frontStages.live);
  });
  it('returns live article ids', () => {
    expect(
      getCollectionArticleQueryString(collectionWithArticles, frontStages.live)
    ).toBe(frontStages.live);
  });
  it('filters out snap links', () => {
    expect(
      getCollectionArticleQueryString(
        collectionWithSnapArticles,
        frontStages.draft
      )
    ).toBe(frontStages.draft);
  });
});
