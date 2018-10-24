import {
  externalArticleFromArticleFragmentSelector,
  createArticleFromArticleFragmentSelector,
  createArticlesInCollectionGroupSelector,
  createArticlesInCollectionSelector,
  createCollectionSelector
} from '../shared';

const state: any = {
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
        pillarName: 'external-pillar',
        fields: {
          headline: 'external-headline',
          trailText: 'external-trailText',
          byline: 'external-byline'
        },
        frontsMeta: {
          tone: 'external-tone'
        }
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
    af1WithOverrides: {
      uuid: 'af1',
      id: 'ea1',
      frontPublicationDate: 1,
      publishedBy: 'A. N. Author',
      meta: {
        headline: 'fragment-headline',
        trailText: 'fragment-trailText',
        byline: 'fragment-byline',
        customKicker: 'fragment-kicker'
      }
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

const stateWithGrouplessCollection: any = {
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

const stateWithSupportingArticles: any = {
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
        groups: ['group1', 'group2'],
        live: ['g1', 'g2'],
        id: 'c1'
      });
    });
  });

  describe('externalArticleFromArticleFragmentSelector', () => {
    it('should create a selector that returns an external article referenced by the given article fragment', () => {
      expect(externalArticleFromArticleFragmentSelector(state, 'af1')).toEqual(
        state.externalArticles.data.ea1
      );
      expect(
        externalArticleFromArticleFragmentSelector(state, 'invalid')
      ).toEqual(undefined);
    });
  });

  describe('createArticleFromArticleFragmentSelector', () => {
    it('should create a selector that returns an article (externalArticle + articleFragment) referenced by the given article fragment', () => {
      const selector = createArticleFromArticleFragmentSelector();
      expect(selector(state, 'af1')).toEqual({
        id: 'ea1',
        pillarName: 'external-pillar',
        frontPublicationDate: 1,
        publishedBy: 'A. N. Author',
        uuid: 'af1',
        headline: 'external-headline',
        thumbnail: undefined,
        tone: 'external-tone',
        trailText: 'external-trailText',
        kicker: 'external-pillar',
        byline: 'external-byline'
      });
      expect(
        selector(state, 'af1WithOverrides')
      ).toEqual({
        id: 'ea1',
        customKicker: 'fragment-kicker',
        pillarName: 'external-pillar',
        frontPublicationDate: 1,
        publishedBy: 'A. N. Author',
        uuid: 'af1',
        headline: 'fragment-headline',
        thumbnail: undefined,
        tone: 'external-tone',
        trailText: 'fragment-trailText',
        kicker: 'fragment-kicker',
        byline: 'fragment-byline'
      });
      expect(selector(state, 'invalid')).toEqual(
        undefined
      );
    });
  });

  describe('createArticlesInCollectionGroupSelector', () => {
    it('should return a list of all the articles in a given collection', () => {
      const selector = createArticlesInCollectionSelector();
      expect(
        selector(state, {
          collectionId: 'c1',
          stage: 'live'
        })
      ).toEqual(['af2', 'af1']);
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
        } as any)
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
});
