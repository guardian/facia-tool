import type { State } from 'types/State';
import { selectCollectionParams } from 'selectors/collectionSelectors';
import { getCollections as fetchCollections } from 'services/faciaApi';
import { getEditionsCollections } from 'services/editionsApi';
import { runStrategy } from './run-strategy';
import { CollectionResponse, EditionCollectionResponse } from 'types/FaciaApi';

const editionCollectionToCollection = (
  col: EditionCollectionResponse
): CollectionResponse => {
  const {
    collection: { items, ...restCol },
    ...restRes
  } = col;
  return {
    ...restRes,
    collection: {
      ...restCol,
      draft: items,
      live: [],
    },
    storiesVisibleByStage: {
      // TODO - remove me once we figure out what to do here!
      live: { mobile: 0, desktop: 0 },
      draft: { mobile: 0, desktop: 0 },
    },
  };
};

const fetchCollectionsStrategy = (
  state: State,
  collectionIds: string[],
  returnOnlyUpdatedCollections: boolean
) =>
  runStrategy<Promise<CollectionResponse[]> | null>(state, {
    front: () =>
      fetchCollections(
        selectCollectionParams(
          state,
          collectionIds,
          returnOnlyUpdatedCollections
        )
      ),
    edition: () =>
      getEditionsCollections(
        selectCollectionParams(
          state,
          collectionIds,
          returnOnlyUpdatedCollections
        )
      ).then((collections) => collections.map(editionCollectionToCollection)), // TODO, this needs to be mirrored on save!
    feast: () =>
      // for testing just picked same from editions code above, need to modify the code properly for feast
      getEditionsCollections(
        selectCollectionParams(
          state,
          collectionIds,
          returnOnlyUpdatedCollections
        )
      ).then((collections) => collections.map(editionCollectionToCollection)), // TODO, this needs to be mirrored on save!
    none: () => null,
  });

export { fetchCollectionsStrategy };
