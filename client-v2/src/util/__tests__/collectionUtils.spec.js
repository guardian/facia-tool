// @flow

import { getCollectionArticleQueryString } from '../collectionUtils';
import { frontStages } from 'Constants/fronts';
import {
  liveArticle,
  draftArticle,
  snapArticle
} from '../../fixtures/articles';

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
    ).toBe('article/draft/1');
  });
  it('returns live article ids if draft is missing', () => {
    expect(
      getCollectionArticleQueryString(
        collectionWithNoDraftArticles,
        frontStages.draft
      )
    ).toBe('article/live/0');
  });
  it('returns live article ids', () => {
    expect(
      getCollectionArticleQueryString(collectionWithArticles, frontStages.live)
    ).toBe('article/live/0');
  });
  it('filters out snap links', () => {
    expect(
      getCollectionArticleQueryString(
        collectionWithSnapArticles,
        frontStages.draft
      )
    ).toBe('article/draft/1');
  });
});
