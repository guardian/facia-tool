import { defaultState } from 'bundles/frontsUIBundle';
import { frontsConfig } from 'fixtures/frontsConfig';
import initialState from './initialState';
import { State } from 'types/State';

const state = {
  ...initialState,
  fronts: {
    ...initialState.fronts,
    frontsConfig: {
      ...initialState.fronts.frontsConfig,
      ...frontsConfig
    }
  },
  editor: {
    ...defaultState,
    frontIdsByPriority: {
      editorial: ['editorialFront', 'editorialFront2']
    },
    collectionIds: [],
    frontIdsByBrowsingStage: {}
  },
  shared: {
    ...initialState.shared,
    collections: {
      ...initialState.shared.collections,
      data: {
        collection1: {
          id: 'collection1',
          draft: ['group1'],
          live: []
        },
        collection6: {
          id: 'collection6',
          draft: [],
          live: []
        }
      }
    },
    groups: {
      ...initialState.shared.groups,
      group1: {
        uuid: 'group1',
        id: 'group1',
        name: 'Group 1',
        articleFragments: [
          'articleFragment1',
          'articleFragment2',
          'articleFragment3'
        ]
      }
    },
    articleFragments: {
      ...initialState.shared.articleFragments,
      articleFragment1: {
        uuid: 'articleFragment1',
        id: 'capiArticle1',
        frontPublicationDate: 0,
        meta: {}
      },
      articleFragment2: {
        uuid: 'articleFragment2',
        id: 'capiArticle2',
        frontPublicationDate: 0,
        meta: {}
      },
      articleFragment3: {
        uuid: 'articleFragment3',
        frontPublicationDate: 0,
        id: 'capiArticle3',
        meta: {}
      }
    },
    externalArticles: {
      ...initialState.shared.externalArticles,
      data: {
        capiArticle1: {
          id: 'capiArticle1',
          urlPath: 'path/capiArticle1',
          frontsMeta: {},
          fields: {}
        },
        capiArticle2: {
          id: 'capiArticle2',
          urlPath: 'path/capiArticle2',
          frontsMeta: {},
          fields: {}
        },
        capiArticle3: {
          id: 'capiArticle3',
          urlPath: 'path/capiArticle3',
          frontsMeta: {},
          fields: {}
        }
      }
    }
  },
  path: '/v2/editorial'
} as State;

export default state;
