// @flow

import { getFrontsConfig } from '../frontsSelectors';
import { frontsConfig } from '../../fixtures';
import type { FrontDetail } from '../../types/Fronts';

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

const config = {};

describe('Filtering fronts correctly', () => {
  it('return an empty array if config is empty', () => {
    expect(getFrontsConfig({ frontsConfig: {}, config }, 'editorial')).toEqual({
      fronts: [],
      collections: []
    });
  });

  it('filters editorial fronts correctly', () => {
    expect(getFrontsConfig({ frontsConfig, config }, 'editorial')).toEqual({
      fronts: editorialFronts,
      collections: []
    });
  });

  it('filters non-editorial fronts correctly', () => {
    expect(getFrontsConfig({ frontsConfig, config }, 'commercial')).toEqual({
      fronts: commercialFronts,
      collections: []
    });
  });
});
