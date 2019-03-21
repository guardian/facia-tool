import {
  isCollectionBackfilledSelector,
  isCollectionLockedSelector,
  createCollectionHasUnsavedArticleEditsWarningSelector,
  createCollectionsInOpenFrontsSelector
} from 'selectors/collectionSelectors';
import { frontsConfig } from 'fixtures/frontsConfig';

import state from 'fixtures/initialState';
import { reducer, initialize, change } from 'redux-form';

const createCleanFormState = () =>
  reducer(
    undefined,
    initialize('56a3b407-741c-439f-a678-175abea44a9f', { field: true })
  );

describe('Checking if Collection Articles on Fronts have dirty form data', () => {
  it('return false if any article in collection is clean', () => {
    const hasUnsavedArticleEditsSelector = createCollectionHasUnsavedArticleEditsWarningSelector();
    const cleanState = { ...state, form: createCleanFormState() };
    expect(
      hasUnsavedArticleEditsSelector(cleanState, {
        collectionSet: 'live',
        collectionId: 'e59785e9-ba82-48d8-b79a-0a80b2f9f808'
      })
    ).toEqual(false);
  });

  it('return true if any article in collection is dirty ', () => {
    const hasUnsavedArticleEditsSelector = createCollectionHasUnsavedArticleEditsWarningSelector();
    const dirtyFormState = reducer(
      createCleanFormState(),
      change('56a3b407-741c-439f-a678-175abea44a9f', 'field', false)
    );
    const dirtyState = { ...state, form: dirtyFormState };

    expect(
      hasUnsavedArticleEditsSelector(dirtyState, {
        collectionSet: 'live',
        collectionId: 'e59785e9-ba82-48d8-b79a-0a80b2f9f808'
      })
    ).toEqual(true);
  });
});

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
  it('validates correctly if Collection is backfilled', () => {
    expect(
      isCollectionBackfilledSelector(
        {
          fronts: {
            frontsConfig
          }
        } as any,
        'collection1'
      )
    ).toEqual(true);
    expect(
      isCollectionBackfilledSelector(
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
