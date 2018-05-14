import {
  createArticleFromArticleFragmentSelector,
  externalArticleFromArticleFragmentSelector,
  createArticlesInCollectionGroupSelector
} from '../shared';

const state = {
  collections: {
    c1: {
      groups: ['group1', 'group2'],
      articles: {
        live: ['af1', 'af2']
      }
    },
    c2: {
      groups: ['group1'],
      articles: {
        draft: ['af3', 'af4']
      }
    }
  },
  externalArticles: {
    ea1: {
      id: 'ea1',
      headline: 'Example external article'
    }
  },
  articleFragments: {
    af1: {
      uuid: 'af1',
      id: 'ea1',
      frontPublicationDate: 1,
      publishedBy: 'A. N. Author',
      meta: {
        group: '0'
      }
    },
    afWithInvalidReference: {
      uuid: 'afWithInvalidReference',
      id: 'invalid',
      meta: {}
    },
    af2: {
      uuid: 'af2',
      meta: {
        group: '1'
      }
    },
    af3: {
      uuid: 'af3',
      meta: {
        group: '0'
      }
    },
    af4: {
      uuid: 'af4',
      meta: {
        group: '0'
      }
    }
  }
};

describe('Shared selectors', () => {
  describe('createExternalArticleFromArticleFragmentSelector', () => {
    it('should create a selector that returns an external article referenced by the given article', () => {
      expect(externalArticleFromArticleFragmentSelector(state, 'af1')).toEqual(
        state.externalArticles.ea1
      );
      expect(
        externalArticleFromArticleFragmentSelector(state, 'invalid')
      ).toEqual(null);
    });
  });

  describe('createArticleFromArticleFragmentSelector', () => {
    it('should derive an Article from an ArticleFragment and an ExternalArticle, using an ArticleFragment id', () => {
      const selector = createArticleFromArticleFragmentSelector();
      expect(selector(state, 'af1')).toEqual({
        id: 'ea1',
        headline: 'Example external article',
        group: '0'
      });
    });
    it('should handle a case where the referenced ArticleFragment does not exist', () => {
      const selector = createArticleFromArticleFragmentSelector();
      expect(selector(state, 'invalid')).toEqual(null);
    });
    it('should handle a case where the ExternalArticle referenced by the ArticleFragment does not exist', () => {
      const selector = createArticleFromArticleFragmentSelector();
      expect(selector(state, 'afWithInvalidReference')).toEqual(null);
    });
  });

  describe('createArticlesInCollectionGroupSelector', () => {
    it('should return a list of articles held by the given collection for the given display index', () => {
      const selector = createArticlesInCollectionGroupSelector();
      expect(
        selector(state, {
          collectionId: 'c1',
          stage: 'live',
          groupDisplayIndex: 0
        })
      ).toEqual(['af2']);
      expect(
        selector(state, {
          collectionId: 'c1',
          stage: 'live',
          groupDisplayIndex: 1
        })
      ).toEqual(['af1']);
      expect(
        selector(state, {
          collectionId: 'c2',
          stage: 'draft',
          groupDisplayIndex: 0
        })
      ).toEqual(['af3', 'af4']);
    });
    it('should return an empty array if the collection is not found', () => {
      const selector = createArticlesInCollectionGroupSelector();
      expect(
        selector(state, {
          collectionId: 'invalid',
          stage: 'live',
          groupDisplayIndex: 0
        })
      ).toEqual([]);
    });
    it('should return an empty array if the stage is not found', () => {
      const selector = createArticlesInCollectionGroupSelector();
      expect(
        selector(state, {
          collectionId: 'c1',
          stage: 'invalid',
          groupDisplayIndex: 0
        })
      ).toEqual([]);
    });
  });
});
