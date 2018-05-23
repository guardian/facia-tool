import {
  createArticleFromArticleFragmentSelector,
  externalArticleFromArticleFragmentSelector,
  createArticlesInCollectionGroupSelector,
  createCollectionsAsTreeSelector
} from '../shared';

const state = {
  collections: {
    c1: {
      id: 'c1',
      groups: ['group1', 'group2'],
      articleFragments: {
        live: ['af1', 'af2']
      }
    },
    c2: {
      id: 'c2',
      groups: ['group1'],
      articleFragments: {
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

const stateWithGrouplessCollection = {
  collections: {
    c1: {
      id: 'c1',
      articleFragments: {
        live: ['af1', 'af2']
      }
    }
  },
  articleFragments: {
    af1: {
      uuid: 'af1',
      id: 'ea1',
      frontPublicationDate: 1,
      publishedBy: 'A. N. Author',
      meta: {}
    },
    af2: {
      uuid: 'af2',
      meta: {}
    }
  }
};

const stateWithSupportingArticles = {
  collections: {
    c1: {
      id: 'c1',
      articleFragments: {
        live: ['af1']
      }
    }
  },
  articleFragments: {
    af1: {
      uuid: 'af1',
      id: 'ea1',
      frontPublicationDate: 1,
      publishedBy: 'A. N. Author',
      meta: {
        supporting: ['af2']
      }
    },
    af2: {
      uuid: 'af2',
      meta: {}
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
          groupName: 'group1'
        })
      ).toEqual(['af2']);
      expect(
        selector(state, {
          collectionId: 'c1',
          stage: 'live',
          groupName: 'group2'
        })
      ).toEqual(['af1']);
      expect(
        selector(state, {
          collectionId: 'c2',
          stage: 'draft',
          groupName: 'group1'
        })
      ).toEqual(['af3', 'af4']);
    });
    it('should return an empty array if the collection is not found', () => {
      const selector = createArticlesInCollectionGroupSelector();
      expect(
        selector(state, {
          collectionId: 'invalid',
          stage: 'live',
          groupName: 'group1'
        })
      ).toEqual([]);
    });
    it('should return an empty array if the stage is not found', () => {
      const selector = createArticlesInCollectionGroupSelector();
      expect(
        selector(state, {
          collectionId: 'c1',
          stage: 'invalid',
          groupName: 'groupName'
        })
      ).toEqual([]);
    });
  });

  describe('createCollectionsAsTreeSelector', () => {
    it('should return a tree of the given collections, containing groups, articles, and articleFragments', () => {
      const selector = createCollectionsAsTreeSelector();
      expect(selector(state, { collectionIds: ['c1'], stage: 'live' })).toEqual(
        {
          collections: [
            {
              id: 'c1',
              groups: [
                {
                  id: 'group1',
                  articleFragments: [
                    {
                      uuid: 'af2',
                      meta: {
                        group: '1'
                      }
                    }
                  ]
                },
                {
                  id: 'group2',
                  articleFragments: [
                    {
                      uuid: 'af1',
                      id: 'ea1',
                      frontPublicationDate: 1,
                      publishedBy: 'A. N. Author',
                      meta: {
                        group: '0'
                      }
                    }
                  ]
                }
              ]
            }
          ]
        }
      );
    });
    it('should handle supporting articles', () => {
      const selector = createCollectionsAsTreeSelector();
      expect(
        selector(stateWithSupportingArticles, {
          collectionIds: ['c1'],
          stage: 'live'
        })
      ).toEqual({
        collections: [
          {
            id: 'c1',
            groups: [
              {
                articleFragments: [
                  {
                    uuid: 'af1',
                    id: 'ea1',
                    frontPublicationDate: 1,
                    publishedBy: 'A. N. Author',
                    meta: {
                      supporting: [
                        {
                          uuid: 'af2',
                          meta: {}
                        }
                      ]
                    }
                  }
                ]
              }
            ]
          }
        ]
      });
    });
    it('should handle collections without groups', () => {
      const selector = createCollectionsAsTreeSelector();
      expect(
        selector(stateWithGrouplessCollection, {
          collectionIds: ['c1'],
          stage: 'live'
        })
      ).toEqual({
        collections: [
          {
            id: 'c1',
            groups: [
              {
                articleFragments: [
                  {
                    uuid: 'af1',
                    id: 'ea1',
                    frontPublicationDate: 1,
                    publishedBy: 'A. N. Author',
                    meta: {}
                  },
                  {
                    uuid: 'af2',
                    meta: {}
                  }
                ]
              }
            ]
          }
        ]
      });
    });
    it('should handle 0-many nonexistent collections', () => {
      const selector = createCollectionsAsTreeSelector();
      expect(
        selector(stateWithGrouplessCollection, {
          collectionIds: [],
          stage: 'live'
        })
      ).toEqual({
        collections: []
      });
      expect(
        selector(stateWithGrouplessCollection, {
          collectionIds: ['invalid'],
          stage: 'live'
        })
      ).toEqual({
        collections: []
      });
      expect(
        selector(stateWithGrouplessCollection, {
          collectionIds: ['invalid', 'alsoInvalid'],
          stage: 'live'
        })
      ).toEqual({
        collections: []
      });
    });
  });
});
