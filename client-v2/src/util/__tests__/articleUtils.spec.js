// @flow
import { draftArticle, draftArticleInGroup } from 'fixtures/articles';
import { getArticlesWithMeta, getArticlesInGroup } from '../articleUtils';

const capi1 = {
  id: '1',
  headline: 'headline1'
};

const capi2 = {
  id: '2',
  headline: 'headline2',
  group: 1
};

const capi4 = {
  id: '4',
  headline: 'headline4',
  group: 1
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

describe('getArticlesInGroup', () => {
  it('puts an article without a group in the last group', () => {
    expect(getArticlesInGroup(1, 2, [capi1])).toEqual([capi1]);
  });

  it('does not put an article without a group in the first group', () => {
    expect(getArticlesInGroup(0, 2, [capi1])).toEqual([]);
  });

  it('puts an article in group one in the first group', () => {
    expect(getArticlesInGroup(0, 2, [capi2])).toEqual([capi2]);
  });

  it('does not put an article in group one to the second group', () => {
    expect(getArticlesInGroup(1, 2, [capi2])).toEqual([]);
  });

  it('puts multiple articles in the correct group, ', () => {
    expect(getArticlesInGroup(0, 2, [capi2, capi4])).toEqual([capi2, capi4]);
  });
});
