import reducer from '../articleFragmentsReducer';
import { updateArticleFragmentMeta } from '../../actions/ArticleFragments';
import { stateWithClipboard } from 'fixtures/clipboard';

describe('articleFragmentsReducer', () => {
  it('should update the article fragment meta', () => {
    expect(
      reducer(
        stateWithClipboard.shared.articleFragments as any,
        updateArticleFragmentMeta('article', {
          headline: 'headline'
        }),
        stateWithClipboard.shared
      ).article.meta
    ).toEqual({
      headline: 'headline'
    });
  });
  it('should overwrite properties', () => {
    expect(
      reducer(
        stateWithClipboard.shared.articleFragments as any,
        updateArticleFragmentMeta('article2', {
          headline: 'headline'
        }),
        stateWithClipboard.shared
      ).article2.meta
    ).toEqual({
      headline: 'headline'
    });
  });
  it('should merge properties if the merge flag is set', () => {
    expect(
      reducer(
        stateWithClipboard.shared.articleFragments as any,
        updateArticleFragmentMeta(
          'article2',
          {
            headline: 'headline'
          },
          { merge: true }
        ),
        stateWithClipboard.shared
      ).article2.meta
    ).toEqual({
      headline: 'headline',
      supporting: ['article3']
    });
  });
});
