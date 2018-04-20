// @flow

import type { FrontsConfig, FrontsClientConfig } from './types/FrontsConfig';

const liveArticle = {
  id: 'article/live/0',
  frontPublicationDate: 1,
  publishedBy: 'Computers',
  meta: {}
};

const draftArticle = {
  id: 'article/draft/1',
  frontPublicationDate: 1,
  publishedBy: 'Computers'
};

const draftArticleInGroup = {
  id: 'article/draft/2',
  frontPublicationDate: 1,
  publishedBy: 'Computers',
  meta: { group: 1 }
};

const snapArticle = {
  id: 'snap/link/3',
  frontPublicationDate: 1,
  publishedBy: 'Computers',
  meta: {}
};

const frontsConfig: FrontsConfig = {
  fronts: {
    editorialFront: {
      collections: ['collection1']
    },
    commercialFront: {
      collections: ['collection1'],
      priority: 'commercial'
    }
  },
  collections: {
    collection1: {
      displayName: 'name',
      type: 'collection'
    }
  }
};

const frontsClientConfig: FrontsClientConfig = {
  fronts: [
    {
      id: 'editorialFront',
      priority: 'editorial',
      collections: ['collection1']
    },
    {
      id: 'commercialFront',
      priority: 'commercial',
      collections: ['collection1']
    }
  ],
  collections: {
    collection1: {
      displayName: 'name',
      type: 'collection'
    }
  }
};

export {
  frontsClientConfig,
  frontsConfig,
  liveArticle,
  draftArticle,
  snapArticle,
  draftArticleInGroup
};
