import set from 'lodash/set';
import { selectIsExternalArticleStale } from '../externalArticlesBundle';
import { initialState } from '../../fixtures/shared';
import { capiArticleWithElementsThumbnail } from 'fixtures/capiArticle';

const exampleArticleWithoutLastModified = capiArticleWithElementsThumbnail;

const exampleArticleWithInvalidLastModified = {
  ...capiArticleWithElementsThumbnail,
  fields: {
    ...capiArticleWithElementsThumbnail.fields,
    lastModified: 'Not a valid date!'
  }
}

const exampleArticleWithLastModified = {
  ...capiArticleWithElementsThumbnail,
  fields: {
    ...capiArticleWithElementsThumbnail.fields,
    lastModified: '2018-10-10T10:10:10Z'
  }
}

describe('selectors', () => {
  describe('selectIsExternalArticleModifiedOlderThanDate', () => {
    it('should return true if the article is not present', () => {
      expect(
        selectIsExternalArticleStale(
          initialState,
          'external-article-does-not-exist',
          '2018-10-10T17:44:11Z'
        )
      ).toBe(true);
    });
    it('should return true if the article lastmodified field is not present', () => {
      const state = set(
        initialState,
        ['externalArticles', 'data', 'external-article-1'],
        exampleArticleWithoutLastModified
      );
      expect(
        selectIsExternalArticleStale(
          state,
          'external-article-1',
          '2018-10-10T17:44:11Z'
        )
      ).toBe(true);
    });
    it('should return true if the article lastmodified date is invalid', () => {
      const state = set(
        initialState,
        ['externalArticles', 'data', 'external-article-1'],
        exampleArticleWithInvalidLastModified
      );
      expect(
        selectIsExternalArticleStale(
          state,
          'external-article-1',
          '2018-10-10T17:44:11Z'
        )
      ).toBe(true);
    });
    it('should return true if the incoming lastmodified date is invalid', () => {
      const state = set(
        initialState,
        ['externalArticles', 'data', 'external-article-1'],
        exampleArticleWithLastModified
      );
      expect(
        selectIsExternalArticleStale(
          state,
          'external-article-1',
          'Not a date!'
        )
      ).toBe(true);
    });
    it('should return true if the incoming lastmodified date is later than the article lastmodified date', () => {
      const state = set(
        initialState,
        ['externalArticles', 'data', 'external-article-1'],
        exampleArticleWithLastModified
      );
      expect(
        selectIsExternalArticleStale(
          state,
          'external-article-1',
          '2018-10-10T10:10:09Z'
        )
      ).toBe(true);
    });
    it('should return false if the incoming lastmodified date is earlier than the article lastmodified date', () => {
      const state = set(
        initialState,
        ['externalArticles', 'data', 'external-article-1'],
        exampleArticleWithLastModified
      );
      expect(
        selectIsExternalArticleStale(
          state,
          'external-article-1',
          '2018-10-10T10:10:11Z'
        )
      ).toBe(false);
    });
  });
});
