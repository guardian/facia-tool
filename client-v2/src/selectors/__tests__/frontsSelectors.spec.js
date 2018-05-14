// @flow

import { frontsConfig } from 'fixtures/frontsConfig';
import type { FrontConfig } from 'services/faciaApi';
import { getFrontsConfig } from '../frontsSelectors';

const editorialFronts: Array<FrontConfig> = [
  {
    collections: ['collection1'],
    id: 'editorialFront',
    priority: 'editorial'
  }
];

const commercialFronts: Array<FrontConfig> = [
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
