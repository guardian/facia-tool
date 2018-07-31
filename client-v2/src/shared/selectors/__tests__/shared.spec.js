// @flow

import {
  externalArticleFromArticleFragmentSelector,
  createArticlesInCollectionGroupSelector,
  createCollectionsAsTreeSelector,
  createCollectionSelector
} from '../shared';

const state = {
  collections: {
    data: {
      c1: {
        id: 'c1',
        groups: ['group1', 'group2'],
        live: ['g1', 'g2']
      },
      c2: {
        id: 'c2',
        groups: ['group1'],
        draft: ['g3']
      },
      c3: {
        groups: ['group1'],
        draft: ['g4']
      },
      c4: {
        groups: ['group1'],
        draft: ['g5']
      }
    }
  },
  groups: {
    g1: {
      uuid: 'g1',
      id: 'group1',
      articleFragments: ['af2']
    },
    g2: {
      uuid: 'g2',
      id: 'group2',
      articleFragments: ['af1']
    },
    g3: {
      uuid: 'g3',
      id: 'group1',
      articleFragments: ['af3', 'af4']
    },
    g4: {
      uuid: 'g4',
      id: 'group1',
      articleFragments: ['af5']
    },
    g5: {
      uuid: 'g5',
      id: 'group1',
      articleFragments: ['af5']
    }
  },
  externalArticles: {
    data: {
      ea1: {
        id: 'ea1',
        headline: 'Example external article'
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
    afWithInvalidReference: {
      uuid: 'afWithInvalidReference',
      id: 'invalid',
      meta: {}
    },
    af2: {
      uuid: 'af2',
      meta: {}
    },
    af3: {
      uuid: 'af3',
      meta: {}
    },
    af4: {
      uuid: 'af4',
      meta: {}
    },
    af5: {
      uuid: 'af5'
    }
  }
};

const stateWithGrouplessCollection = {
  collections: {
    data: {
      c1: {
        id: 'c1',
        live: ['g1']
      }
    }
  },
  groups: {
    g1: {
      uuid: 'g1',
      id: null,
      articleFragments: ['af1', 'af2']
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
    data: {
      c1: {
        id: 'c1',
        live: ['g1']
      }
    }
  },
  groups: {
    g1: {
      uuid: 'g1',
      id: null,
      articleFragments: ['af1']
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
  describe('createCollectionSelector', () => {
    it('should select a collection by id, reversing the group ids if they exist', () => {
      const selector = createCollectionSelector();
      expect(selector(state, { collectionId: 'c1' })).toEqual({
        groups: ['group2', 'group1'],
        live: ['g1', 'g2'],
        id: 'c1'
      });
    });
  });

  describe('createExternalArticleFromArticleFragmentSelector', () => {
    it('should create a selector that returns an external article referenced by the given article', () => {
      expect(externalArticleFromArticleFragmentSelector(state, 'af1')).toEqual(
        state.externalArticles.data.ea1
      );
      expect(
        externalArticleFromArticleFragmentSelector(state, 'invalid')
      ).toEqual(null);
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
    it("should handle articles that don't contain a meta key", () => {
      const selector = createArticlesInCollectionGroupSelector();
      expect(
        selector(state, {
          collectionId: 'c4',
          stage: 'draft',
          groupName: 'invalidGroup'
        })
      ).toEqual([]);
    });
    it('should assume that articles without a meta key are in the first available group', () => {
      const selector = createArticlesInCollectionGroupSelector();
      expect(
        selector(state, {
          collectionId: 'c3',
          stage: 'draft',
          groupName: 'group1'
        })
      ).toEqual(['af5']);
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
                  uuid: 'g1',
                  articleFragments: [
                    {
                      uuid: 'af2',
                      meta: {
                        supporting: []
                      }
                    }
                  ]
                },
                {
                  id: 'group2',
                  uuid: 'g2',
                  articleFragments: [
                    {
                      uuid: 'af1',
                      id: 'ea1',
                      frontPublicationDate: 1,
                      publishedBy: 'A. N. Author',
                      meta: {
                        supporting: []
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
                id: null,
                uuid: 'g1',
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
                id: null,
                uuid: 'g1',
                articleFragments: [
                  {
                    uuid: 'af1',
                    id: 'ea1',
                    frontPublicationDate: 1,
                    publishedBy: 'A. N. Author',
                    meta: {
                      supporting: []
                    }
                  },
                  {
                    uuid: 'af2',
                    meta: {
                      supporting: []
                    }
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
