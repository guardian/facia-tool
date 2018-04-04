// @flow

import filterFrontsByPriority from '../filterFrontsByPriority';
import type { FrontsConfig, FrontDetail } from '../../types/Fronts';

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

const editorialFronts: Array<FrontDetail> = [
  { collections: ['collection1'], id: 'editorialFront' }
];

const commercialFronts: Array<FrontDetail> = [
  {
    collections: ['collection1'],
    id: 'commercialFront',
    priority: 'commercial'
  }
];

const commercialPriority = 'commercial';
const editorialPriority = 'editorial';

describe('Filtering fronts correctly', () => {
  it('filters editorial fronts correctly', () => {
    expect(filterFrontsByPriority(frontsConfig, editorialPriority)).toEqual(
      editorialFronts
    );
  });

  it('filters non-editorial fronts correctly', () => {
    expect(filterFrontsByPriority(frontsConfig, commercialPriority)).toEqual(
      commercialFronts
    );
  });
});
