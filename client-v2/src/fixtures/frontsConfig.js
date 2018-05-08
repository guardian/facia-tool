// @flow

import type {
  FrontsConfig,
  FrontConfig,
  CollectionConfig
} from 'services/faciaApi';

const frontsConfig: FrontsConfig = {
  fronts: {
    editorialFront: {
      id: 'editorialFront',
      collections: ['collection1'],
      priority: 'editorial'
    },
    commercialFront: {
      id: 'commercialFront',
      collections: ['collection1'],
      priority: 'commercial'
    }
  },
  collections: {
    collection1: {
      id: 'collection1',
      displayName: 'name',
      type: 'collection'
    }
  }
};

const frontsClientConfig: {
  fronts: FrontConfig[],
  collections: {
    [string]: CollectionConfig
  }
} = {
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
      id: 'collection1',
      displayName: 'name',
      type: 'collection'
    }
  }
};

export { frontsClientConfig, frontsConfig };
