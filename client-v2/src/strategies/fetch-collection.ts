import { State } from 'types/State';
import { collectionParamsSelector } from 'selectors/collectionSelectors';
import { getCollections as fetchCollections } from 'services/faciaApi';
import { runStrategy } from './run-strategy';
import { CollectionResponse } from 'types/FaciaApi';

const fetchCollectionsStrategy = async (
  state: State,
  collectionIds: string[],
  returnOnlyUpdatedCollections: boolean = false
) =>
  runStrategy<Promise<CollectionResponse[]> | null>(state, {
    front: () =>
      fetchCollections(
        collectionParamsSelector(
          state,
          collectionIds,
          returnOnlyUpdatedCollections
        )
      ),
    edition: () => null,
    none: () => null
  });

export { fetchCollectionsStrategy };
