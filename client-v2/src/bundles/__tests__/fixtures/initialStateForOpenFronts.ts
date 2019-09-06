import { defaultState } from 'bundles/frontsUIBundle';
import { frontsConfig } from 'fixtures/frontsConfig';

const initialState = {
  fronts: {
    frontsConfig
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
    collections: {
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
      group1: {
        uuid: 'group1',
        articleFragments: [
          'articleFragment1',
          'articleFragment2',
          'articleFragment3'
        ]
      }
    },
    articleFragments: {
      articleFragment1: {
        uuid: 'articleFragment1',
        id: 'capiArticle1',
        meta: {}
      },
      articleFragment2: {
        uuid: 'articleFragment2',
        id: 'capiArticle2',
        meta: {}
      },
      articleFragment3: {
        uuid: 'articleFragment3',
        id: 'capiArticle3',
        meta: {}
      }
    },
    externalArticles: {
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
} as any;
export default initialState;
