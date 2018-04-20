// @flow

import { getArticlesWithMeta } from '../articleUtils';

import { draftArticle, draftArticleInGroup } from '../../fixtures';

const capi1 = {
  id: '1',
  headline: 'headline1'
};

const capi2 = {
  id: '2',
  headline: 'headline2'
};

describe('getArticlesWithMeta', () => {
  it('returns articles with no meta correctly', () => {
    expect(getArticlesWithMeta([draftArticle], [capi1])).toEqual([capi1]);
  });
  it('returns articles with metadata correctly', () => {
    expect(getArticlesWithMeta([draftArticleInGroup], [capi2])).toEqual([
      Object.assign({}, capi2, { group: 1 })
    ]);
  });
  it('adds correct metadata for multiple articles correctly', () => {
    expect(
      getArticlesWithMeta([draftArticle, draftArticleInGroup], [capi1, capi2])
    ).toEqual([capi1, Object.assign({}, capi2, { group: 1 })]);
  });
});
