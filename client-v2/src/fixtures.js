// @flow

import type { FrontsConfig, FrontsClientConfig } from './types/FrontsConfig';

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

export { frontsClientConfig, frontsConfig };
