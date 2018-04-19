// @flow

import { getCollectionArticleQueryString } from '../collectionUtils';

const liveArticle = {
  id: 'live',
  frontPublicationDate: 1,
  publishedBy: 'Computers',
  meta: {}
};

const draftArticle = {
  id: 'draft',
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
      getCollectionArticleQueryString(collectionWithArticles, 'draft')
    ).toBe('draft');
  });
  it('returns live article ids if draft is missing', () => {
    expect(
      getCollectionArticleQueryString(collectionWithNoDraftArticles, 'draft')
    ).toBe('live');
  });
  it('returns live article ids', () => {
    expect(
      getCollectionArticleQueryString(collectionWithArticles, 'live')
    ).toBe('live');
  });
  it('filters out snap links', () => {
    expect(
      getCollectionArticleQueryString(collectionWithSnapArticles, 'draft')
    ).toBe('draft');
  });
});
