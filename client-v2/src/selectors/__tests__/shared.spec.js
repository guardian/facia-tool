import { getArticleFromArticleFragment } from '../shared';

const state = {
  externalArticles: {
    ea1: {
      id: 'ea1',
      headline: 'Example external article'
    }
  },
  articleFragments: {
    af1: {
      uuid: 'af1',
      id: 1,
      frontPublicationDate: 1,
      publishedBy: 'A. N. Author',
      meta: {
        group: 1
      }
    }
  }
};

describe('Shared selectors', () => {
  describe('getArticleFromArticleFragment', () => {
    it('should derive an Article from an ArticleFragment and an ExternalArticle, using an ArticleFragment id', () => {

    });
    it('should handle a case where the referenced ArticleFragment does not exist', () => {

    });
    it('should handle a case where the ExternalArticle referenced by the ArticleFragment does not exist', () => {

    });
  });
});
