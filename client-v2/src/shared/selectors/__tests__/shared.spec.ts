import {
  selectExternalArticleFromArticleFragment,
  createSelectArticleFromArticleFragment,
  createSelectArticlesInCollectionGroup,
  createSelectArticlesInCollection,
  createSelectCollection,
  selectGroupSiblings
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
      },
      c5: {
        id: 'c5',
        groups: ['group6'],
        live: ['g6']
      },
      c6: {
        id: 'c1',
        groups: ['group1', 'group2'],
        live: ['g1', 'g2', 'g7']
      }
    }
  },
  groups: {
    g1: {
      uuid: 'g1',
      id: 'group1',
      articleFragments: ['af2'],
      name: 'g1'
    },
    g2: {
      uuid: 'g2',
      id: 'group2',
      articleFragments: ['af1'],
      name: 'g2'
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
    },
    g6: {
      uuid: 'g6',
      id: 'group6',
      articleFragments: ['afWithSupporting']
    }
  },
  externalArticles: {
    data: {
      ea1: {
        id: 'ea1',
        pillarName: 'external-pillar',
        frontsMeta: {
          defaults: {}
        },
        fields: {
          headline: 'external-headline',
          trailText: 'external-trailText',
          byline: 'external-byline',
          isLive: 'true',
          firstPublicationDate: '2018-10-19T10:30:39Z'
        }
      },
      ea2: {
        id: 'ea2',
        pillarName: 'external-pillar',
        frontsMeta: {
          defaults: {}
        },
        fields: {
          headline: 'external-headline',
          trailText: 'external-trailText',
          byline: 'external-byline',
          isLive: 'false',
          firstPublicationDate: '2018-10-19T10:30:39Z'
        }
      },
      ea3: {
        id: 'ea3',
        pillarName: 'external-pillar',
        frontsMeta: {
          defaults: {}
        },
        fields: {
          headline: 'external-headline',
          trailText: 'external-trailText',
          byline: 'external-byline'
        }
      },
      ea4: {
        id: 'ea4',
        pillarName: 'external-pillar',
        frontsMeta: {
          defaults: {
            imageCutoutReplace: false,
            imageHide: false,
            imageReplace: false,
            imageSlideshowReplace: false,
            isBoosted: false,
            isBreaking: false,
            showLargeHeadline: false,
            showByline: false,
            showKickerCustom: false,
            showKickerSection: false,
            showKickerTag: false,
            showLivePlayable: false,
            showMainVideo: false,
            showQuotedHeadline: false
          }
        },
        fields: {
          headline: 'external-headline',
          trailText: 'external-trailText',
          byline: 'external-byline'
        }
      },
      ea5: {
        id: 'ea5',
        pillarName: 'external-pillar',
        tags: [{ webTitle: 'tag', sectionName: 'section' }],
        frontsMeta: {
          defaults: {}
        },
        fields: {
          headline: 'external-headline',
          trailText: 'external-trailText',
          byline: 'external-byline'
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
        customKicker: 'fragment-kicker',
        showKickerCustom: true
      }
    },
    afWithInvalidReference: {
      uuid: 'afWithInvalidReference',
      id: 'invalid',
      meta: {}
    },
    af2: {
      uuid: 'af2',
      meta: {},
      id: 'ea2'
    },
    af3: {
      uuid: 'af3',
      meta: {},
      id: 'ea3'
    },
    af4: {
      uuid: 'af4',
      meta: {},
      id: 'ea4'
    },
    af5: {
      uuid: 'af5'
    },
    af6: {
      uuid: 'af5'
    },
    afWithTagKicker: {
      uuid: 'afWithTagKicker',
      id: 'ea5',
      frontPublicationDate: 1,
      publishedBy: 'A. N. Author',
      meta: {
        headline: 'fragment-headline',
        trailText: 'fragment-trailText',
        byline: 'fragment-byline',
        showKickerTag: true
      }
    },
    afWithSectionKicker: {
      uuid: 'afWithSectionKicker',
      id: 'ea5',
      frontPublicationDate: 1,
      publishedBy: 'A. N. Author',
      meta: {
        headline: 'fragment-headline',
        trailText: 'fragment-trailText',
        byline: 'fragment-byline',
        showKickerSection: true
      }
    },
    afWithSupporting: {
      uuid: 'afWithSupporting',
      id: 'ea5',
      frontPublicationDate: 1,
      publishedBy: 'A. N. Author',
      meta: {
        supporting: ['afWithSectionKicker']
      }
    }
  }
};

describe('Shared selectors', () => {
  describe('createCollectionSelector', () => {
    it('should select a collection by id', () => {
      const selector = createSelectCollection();
      expect(selector(state, { collectionId: 'c1' })).toEqual({
        groups: ['group1', 'group2'],
        live: ['g1', 'g2'],
        id: 'c1'
      });
    });
  });

  describe('externalArticleFromArticleFragmentSelector', () => {
    it('should create a selector that returns an external article referenced by the given article fragment', () => {
      expect(selectExternalArticleFromArticleFragment(state, 'af1')).toEqual(
        state.externalArticles.data.ea1
      );
      expect(
        selectExternalArticleFromArticleFragment(state, 'invalid')
      ).toEqual(undefined);
    });
  });

  describe('createArticleFromArticleFragmentSelector', () => {
    it('should create a selector that returns an article (externalArticle + articleFragment) referenced by the given article fragment', () => {
      const selector = createSelectArticleFromArticleFragment();
      expect(selector(state, 'af1')).toMatchObject({
        id: 'ea1',
        pillarName: 'external-pillar',
        frontPublicationDate: 1,
        publishedBy: 'A. N. Author',
        uuid: 'af1',
        headline: 'external-headline',
        thumbnail: undefined,
        trailText: 'external-trailText',
        byline: 'external-byline',
        isLive: true,
        firstPublicationDate: '2018-10-19T10:30:39Z'
      });

      expect(selector(state, 'af1WithOverrides')).toMatchObject({
        id: 'ea1',
        customKicker: 'fragment-kicker',
        pillarName: 'external-pillar',
        frontPublicationDate: 1,
        publishedBy: 'A. N. Author',
        uuid: 'af1',
        headline: 'fragment-headline',
        thumbnail: undefined,
        trailText: 'fragment-trailText',
        kicker: 'fragment-kicker',
        byline: 'fragment-byline',
        isLive: true,
        firstPublicationDate: '2018-10-19T10:30:39Z',
        pillarId: undefined,
        showKickerCustom: true
      });
      expect(selector(state, 'invalid')).toEqual(undefined);
    });
    it('should set isLive property to false if article is not live', () => {
      const selector = createSelectArticleFromArticleFragment();
      expect(selector(state, 'af2')).toMatchObject({
        isLive: false
      });
    });
    it('should set isLive to true if property is missing', () => {
      const selector = createSelectArticleFromArticleFragment();
      expect(selector(state, 'af3')).toMatchObject({
        isLive: true
      });
    });
    it('should populate default metadata correctly', () => {
      const selector = createSelectArticleFromArticleFragment();
      expect(selector(state, 'af4')).toEqual({
        id: 'ea4',
        pillarName: 'external-pillar',
        uuid: 'af4',
        headline: 'external-headline',
        thumbnail: undefined,
        trailText: 'external-trailText',
        byline: 'external-byline',
        isLive: true,
        imageCutoutReplace: false,
        imageHide: false,
        imageReplace: false,
        imageSlideshowReplace: false,
        isBoosted: false,
        isBreaking: false,
        showLargeHeadline: false,
        showByline: false,
        showKickerCustom: false,
        showKickerSection: false,
        showKickerTag: false,
        showLivePlayable: false,
        showMainVideo: false,
        showQuotedHeadline: false,
        hasMainVideo: false,
        kicker: undefined,
        pillarId: undefined,
        tone: undefined,
        cutoutThumbnail: undefined,
        firstPublicationDate: undefined,
        frontPublicationDate: undefined
      });
    });
  });

  describe('createArticlesInCollectionSelector', () => {
    it('should return a list of all the articles in a given collection', () => {
      const selector = createSelectArticlesInCollection();
      expect(
        selector(state, {
          collectionId: 'c1',
          collectionSet: 'live'
        })
      ).toEqual(['af2', 'af1']);
    });
    it('should return articles in supporting positions', () => {
      const selector = createSelectArticlesInCollection();
      expect(
        selector(state, {
          collectionId: 'c5',
          collectionSet: 'live'
        })
      ).toEqual(['afWithSupporting', 'afWithSectionKicker']);
    });
    it('should not return articles in supporting positions if includeSupportingArticles is false', () => {
      const selector = createSelectArticlesInCollection();
      expect(
        selector(state, {
          collectionId: 'c5',
          collectionSet: 'live',
          includeSupportingArticles: false
        })
      ).toEqual(['afWithSupporting']);
    });
  });

  describe('createArticlesInCollectionGroupSelector', () => {
    it('should return a list of articles held by the given collection for the given display index', () => {
      const selector = createSelectArticlesInCollectionGroup();
      expect(
        selector(state, {
          collectionId: 'c1',
          collectionSet: 'live',
          groupName: 'group1'
        })
      ).toEqual(['af2']);
      expect(
        selector(state, {
          collectionId: 'c1',
          collectionSet: 'live',
          groupName: 'group2'
        })
      ).toEqual(['af1']);
      expect(
        selector(state, {
          collectionId: 'c2',
          collectionSet: 'draft',
          groupName: 'group1'
        })
      ).toEqual(['af3', 'af4']);
    });
    it('should put articles which are in groups that don`t exis in the config in the first group', () => {
      const selector = createSelectArticlesInCollectionGroup();
      const currentGroups = state.groups;
      const newGroups = {
        ...currentGroups,
        ...{ g7: { uuid: 'g7', id: 'group7', articleFragments: ['af6'] } }
      };
      expect(
        selector(
          { ...state, ...{ groups: newGroups } },
          {
            collectionId: 'c6',
            collectionSet: 'live'
          }
        )
      ).toEqual(['af6', 'af2', 'af1']);
    });
    it('should put articles which are in groups that don`t exis in the config in the first group even when none of the groups have names', () => {
      const selector = createSelectArticlesInCollectionGroup();
      const newGroups = {
        ...{ g1: { uuid: 'g1', articleFragments: ['af4'] } },
        ...{ g2: { uuid: 'g2', id: 'group6', articleFragments: ['af5'] } },
        ...{ g7: { uuid: 'g7', id: 'group7', articleFragments: ['af6'] } }
      };
      expect(
        selector(
          { ...state, ...{ groups: newGroups } },
          {
            collectionId: 'c6',
            collectionSet: 'live'
          }
        )
      ).toEqual(['af5', 'af6', 'af4']);
    });
    it('should return articles in supporting positions', () => {
      const selector = createSelectArticlesInCollectionGroup();
      expect(
        selector(state, {
          collectionId: 'c5',
          collectionSet: 'live',
          groupName: 'group6'
        })
      ).toEqual(['afWithSupporting', 'afWithSectionKicker']);
    });
    it('should not return articles in supporting positions if includeSupportingArticles is false', () => {
      const selector = createSelectArticlesInCollectionGroup();
      expect(
        selector(state, {
          collectionId: 'c5',
          collectionSet: 'live',
          groupName: 'group6',
          includeSupportingArticles: false
        })
      ).toEqual(['afWithSupporting']);
    });
    it('should return an empty array if the collection is not found', () => {
      const selector = createSelectArticlesInCollectionGroup();
      expect(
        selector(state, {
          collectionId: 'invalid',
          collectionSet: 'live',
          groupName: 'group1'
        })
      ).toEqual([]);
    });
    it('should return an empty array if the collectionSet is not found', () => {
      const selector = createSelectArticlesInCollectionGroup();
      expect(
        selector(state, {
          collectionId: 'c1',
          collectionSet: 'invalid',
          groupName: 'groupName'
        } as any)
      ).toEqual([]);
    });
    it("should handle articles that don't contain a meta key", () => {
      const selector = createSelectArticlesInCollectionGroup();
      expect(
        selector(state, {
          collectionId: 'c4',
          collectionSet: 'draft',
          groupName: 'invalidGroup'
        })
      ).toEqual([]);
    });
    it('should assume that articles without a meta key are in the first available group', () => {
      const selector = createSelectArticlesInCollectionGroup();
      expect(
        selector(state, {
          collectionId: 'c3',
          collectionSet: 'draft',
          groupName: 'group1'
        })
      ).toEqual(['af5']);
    });
    it('should set the correct kicker when tag kicker is set ', () => {
      const selector = createSelectArticleFromArticleFragment();

      expect(selector(state, 'afWithTagKicker')).toMatchObject({
        kicker: 'tag'
      });
    });
    it('should set the correct kicker when section kicker is set ', () => {
      const selector = createSelectArticleFromArticleFragment();

      expect(selector(state, 'afWithSectionKicker')).toMatchObject({
        kicker: 'section'
      });
    });
  });

  describe('groupSiblingsSelector', () => {
    it('selects the sibling groups of a given group id', () => {
      expect(selectGroupSiblings(state, 'g1').map(({ uuid }) => uuid)).toEqual([
        'g1',
        'g2'
      ]);
    });
  });
});
