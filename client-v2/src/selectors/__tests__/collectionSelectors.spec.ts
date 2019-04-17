import {
  isCollectionLockedSelector,
  createCollectionsInOpenFrontsSelector
} from 'selectors/collectionSelectors';
import { frontsConfig } from 'fixtures/frontsConfig';

describe('Validating Front Collection configuration metadata', () => {
  it('validates correctly if Collection is uneditable ', () => {
    expect(
      isCollectionLockedSelector(
        {
          fronts: {
            frontsConfig
          }
        } as any,
        'collection1'
      )
    ).toEqual(true);
    expect(
      isCollectionLockedSelector(
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
  const collectionsInOpenFrontsSelector = createCollectionsInOpenFrontsSelector();
  it('return correct collections for one open Front', () => {
    expect(
      collectionsInOpenFrontsSelector(
        {
          fronts: {
            frontsConfig
          },
          editor: {
            frontIdsByPriority: { editorial: ['editorialFront'] }
          }
        } as any,
        'editorial'
      )
    ).toEqual(['collection1']);
  });
  it('return correct collections for multiple open Fronts', () => {
    expect(
      collectionsInOpenFrontsSelector(
        {
          fronts: {
            frontsConfig
          },
          editor: {
            frontIdsByPriority: {
              editorial: ['editorialFront', 'editorialFront2']
            }
          }
        } as any,
        'editorial'
      )
    ).toEqual(['collection1', 'collection6']);
  });
  it('return enpty array for no open Fronts', () => {
    expect(
      collectionsInOpenFrontsSelector(
        {
          fronts: {
            frontsConfig
          },
          editor: {
            frontIdsByPriority: {}
          }
        } as any,
        'editorial'
      )
    ).toEqual([]);
  });
});
