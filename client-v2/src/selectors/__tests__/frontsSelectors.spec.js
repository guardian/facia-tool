// @flow

import { getFrontsConfig } from '../frontsSelectors';
import { frontsConfig } from '../../fixtures';
import type { FrontDetail } from '../../types/FrontsConfig';

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

describe('Filtering fronts correctly', () => {
  it('return an empty array if config is empty', () => {
    expect(getFrontsConfig({}, {}, [], 'editorial')).toEqual({
      fronts: [],
      collections: {}
    });
  });

  it('filters editorial fronts correctly', () => {
    expect(
      getFrontsConfig(
        frontsConfig.fronts,
        frontsConfig.collections,
        Object.keys(frontsConfig.fronts),
        'editorial'
      )
    ).toEqual({
      fronts: editorialFronts,
      collections: frontsConfig.collections
    });
  });

  it('filters non-editorial fronts correctly', () => {
    expect(
      getFrontsConfig(
        frontsConfig.fronts,
        frontsConfig.collections,
        Object.keys(frontsConfig.fronts),
        'commercial'
      )
    ).toEqual({
      fronts: commercialFronts,
      collections: frontsConfig.collections
    });
  });
});
