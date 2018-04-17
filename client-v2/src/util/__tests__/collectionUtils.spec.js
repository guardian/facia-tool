// @flow

import {
  getDraftArticles,
  getCollectionArticleQueryString
} from '../collectionUtils';

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

const collectionWithDraftArticles = {
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

describe('getDraftArticles', () => {
  it('returns empty list if collection is missing', () => {
    expect(getDraftArticles(null)).toEqual([]);
  });
  it('returns list of live articles if draft list is missing', () => {
    expect(getDraftArticles(collectionWithNoDraftArticles)).toEqual([
      liveArticle
    ]);
  });
  it('returns list of draft articles when draft articles exist', () => {
    expect(getDraftArticles(collectionWithDraftArticles)).toEqual([
      draftArticle
    ]);
  });
});

describe('getCollectionArticleQueryString', () => {
  it('returns article ids', () => {
    expect(getCollectionArticleQueryString(collectionWithDraftArticles)).toBe(
      'draft'
    );
  });
  it('filters out snap links', () => {
    expect(getCollectionArticleQueryString(collectionWithSnapArticles)).toBe(
      'draft'
    );
  });
});
