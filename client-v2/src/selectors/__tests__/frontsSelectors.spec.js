// @flow

import { getFrontsWithPriority } from '../frontsSelectors';
import { frontsConfig } from '../../fixtures/frontsConfig';
import type { FrontDetail } from '../../types/FrontsConfig';

const editorialFronts: Array<FrontDetail> = [
  {
    collections: ['collection1'],
    id: 'editorialFront',
    priority: 'editorial'
  }
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
    expect(
      getFrontsWithPriority(
        {
          frontsConfig: {
            fronts: {}
          }
        },
        'editorial'
      )
    ).toEqual([]);
  });

  it('filters editorial fronts correctly', () => {
    expect(
      getFrontsWithPriority(
        {
          frontsConfig
        },
        'editorial'
      )
    ).toEqual(editorialFronts);
  });

  it('filters non-editorial fronts correctly', () => {
    expect(
      getFrontsWithPriority(
        {
          frontsConfig
        },
        'commercial'
      )
    ).toEqual(commercialFronts);
  });
});
