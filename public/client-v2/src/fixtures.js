// @flow

import type { FrontsConfig } from './types/Fronts';

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

export { frontsConfig };
