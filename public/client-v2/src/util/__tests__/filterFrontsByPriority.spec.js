// @flow

import filterFrontsByPriority from '../filterFrontsByPriority';
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
