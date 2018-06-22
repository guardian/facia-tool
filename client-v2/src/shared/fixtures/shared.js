// @flow

const collection = {
  live: [
    {
      id: 'article/live/0',
      frontPublicationDate: 1,
      publishedBy: 'Computers',
      meta: {}
    },
    {
      id: 'article/draft/1',
      frontPublicationDate: 2,
      publishedBy: 'Computers',
      meta: {}
    },
    {
      id: 'a/long/path/2',
      frontPublicationDate: 2,
      publishedBy: 'Computers',
      meta: {}
    }
  ],
  id: 'exampleCollection',
  displayName: 'Example Collection'
};

const collectionWithSupportingArticles = {
  live: [
    {
      id: 'article/live/0',
      frontPublicationDate: 1,
      publishedBy: 'Computers',
      meta: {}
    },
    {
      id: 'a/long/path/1',
      frontPublicationDate: 1,
      publishedBy: 'Computers',
      meta: {
        supporting: [
          {
            id: 'article/draft/2',
            frontPublicationDate: 2,
            publishedBy: 'Computers',
            meta: {}
          },
          {
            id: 'article/draft/3',
            frontPublicationDate: 3,
            publishedBy: 'Computers',
            meta: {}
          }
        ]
      }
    }
  ],
  id: 'exampleCollection',
  displayName: 'Example Collection'
};

const stateWithCollection = {
  shared: {
    collections: {
      data: {
        exampleCollection: {
          id: 'exampleCollection',
          displayName: 'Example Collection',
          articleFragments: {
            live: [
              '95e2bfc0-8999-4e6e-a359-19960967c1e0',
              '4bc11359-bb3e-45e7-a0a9-86c0ee52653d',
              '12e1d70d-bad5-4c8d-b53c-cf38d01bc11d'
            ],
            draft: [],
            previously: undefined
          }
        }
      }
    },
    articleFragments: {
      '95e2bfc0-8999-4e6e-a359-19960967c1e0': {
        id: '0',
        idWithPath: 'article/live/0',
        frontPublicationDate: 1,
        publishedBy: 'Computers',
        meta: {},
        uuid: '95e2bfc0-8999-4e6e-a359-19960967c1e0'
      },
      '4bc11359-bb3e-45e7-a0a9-86c0ee52653d': {
        id: '1',
        idWithPath: 'article/draft/1',
        frontPublicationDate: 2,
        publishedBy: 'Computers',
        meta: {},
        uuid: '4bc11359-bb3e-45e7-a0a9-86c0ee52653d'
      },
      '12e1d70d-bad5-4c8d-b53c-cf38d01bc11d': {
        id: '2',
        idWithPath: 'a/long/path/2',
        frontPublicationDate: 2,
        publishedBy: 'Computers',
        meta: {},
        uuid: '12e1d70d-bad5-4c8d-b53c-cf38d01bc11d'
      }
    }
  }
};

const stateWithCollectionAndSupporting = {
  shared: {
    collections: {
      data: {
        exampleCollection: {
          id: 'exampleCollection',
          displayName: 'Example Collection',
          articleFragments: {
            live: [
              '1269c42e-a341-4464-b206-a5731b92fa46',
              '322f0527-cf14-43c1-8520-e6732ab01297'
            ],
            draft: [],
            previously: undefined
          }
        }
      }
    },
    articleFragments: {
      '1269c42e-a341-4464-b206-a5731b92fa46': {
        id: '0',
        idWithPath: 'article/live/0',
        frontPublicationDate: 1,
        publishedBy: 'Computers',
        meta: {},
        uuid: '1269c42e-a341-4464-b206-a5731b92fa46'
      },
      '134c9d4f-b05c-43f4-be41-a605b6dccab9': {
        id: '2',
        idWithPath: 'article/draft/2',
        frontPublicationDate: 2,
        publishedBy: 'Computers',
        meta: {},
        uuid: '134c9d4f-b05c-43f4-be41-a605b6dccab9'
      },
      '4c21ff2c-e2c5-4bac-ae14-24beb3f8d8b5': {
        id: '3',
        idWithPath: 'article/draft/3',
        frontPublicationDate: 3,
        publishedBy: 'Computers',
        meta: {},
        uuid: '4c21ff2c-e2c5-4bac-ae14-24beb3f8d8b5'
      },
      '322f0527-cf14-43c1-8520-e6732ab01297': {
        id: '1',
        idWithPath: 'a/long/path/1',
        frontPublicationDate: 1,
        publishedBy: 'Computers',
        meta: {
          supporting: [
            '134c9d4f-b05c-43f4-be41-a605b6dccab9',
            '4c21ff2c-e2c5-4bac-ae14-24beb3f8d8b5'
          ]
        },
        uuid: '322f0527-cf14-43c1-8520-e6732ab01297'
      }
    }
  }
};

export {
  collection,
  collectionWithSupportingArticles,
  stateWithCollection,
  stateWithCollectionAndSupporting
};
