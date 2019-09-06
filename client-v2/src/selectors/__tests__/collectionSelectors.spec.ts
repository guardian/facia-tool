import {
  selectIsCollectionLocked,
  createSelectCollectionsInOpenFronts
} from 'selectors/collectionSelectors';
import { frontsConfig } from 'fixtures/frontsConfig';

describe('Validating Front Collection configuration metadata', () => {
  it('validates correctly if Collection is uneditable ', () => {
    expect(
      selectIsCollectionLocked(
        {
          fronts: {
            frontsConfig
          }
        } as any,
        'collection1'
      )
    ).toEqual(true);
    expect(
      selectIsCollectionLocked(
        {
          fronts: {
            frontsConfig
          }
        } as any,
        'collection2'
      )
    ).toEqual(false);
  });
});

describe('Selecting collections on all open Fronts', () => {
  const selectCollectionsInOpenFronts = createSelectCollectionsInOpenFronts();
  it('return correct collections for one open Front', () => {
    expect(
      selectCollectionsInOpenFronts({
        fronts: {
          frontsConfig
        },
        editor: {
          frontIdsByPriority: { editorial: ['editorialFront'] }
        },
        path: 'v2/editorial'
      } as any)
    ).toEqual(['collection1']);
  });
  it('return correct collections for multiple open Fronts', () => {
    expect(
      selectCollectionsInOpenFronts({
        fronts: {
          frontsConfig
        },
        editor: {
          frontIdsByPriority: {
            editorial: ['editorialFront', 'editorialFront2']
          }
        },
        path: 'v2/editorial'
      } as any)
    ).toEqual(['collection1', 'collection6']);
  });
  it('return enpty array for no open Fronts', () => {
    expect(
      selectCollectionsInOpenFronts({
        fronts: {
          frontsConfig
        },
        editor: {
          frontIdsByPriority: {}
        },
        path: 'v2/editorial'
      } as any)
    ).toEqual([]);
  });
});
