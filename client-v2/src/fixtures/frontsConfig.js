// @flow

import type { FrontsConfig } from 'services/faciaApi';

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

export { frontsConfig };
