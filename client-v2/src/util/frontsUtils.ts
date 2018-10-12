

import { FrontConfig, CollectionConfig } from 'types/FaciaApi';
import { CollectionWithNestedArticles } from 'shared/types/Collection';
import { detectPressFailureMs } from 'constants/fronts';

const getFrontCollections = (
  frontId: ?string,
  fronts: Array<FrontConfig>,
  collections: { [id: string]: CollectionConfig }
): Array<CollectionConfig> => {
  if (!frontId) {
    return [];
  }
  const selectedFront: ?FrontConfig = fronts.find(
    (front: FrontConfig) => front.id === frontId
  );

  if (selectedFront) {
    return selectedFront.collections.map(
      collectionId => collections[collectionId]
    );
  }

  return [];
};

const combineCollectionWithConfig = (
  collectionConfig: CollectionConfig,
  collection: CollectionWithNestedArticles
): CollectionWithNestedArticles =>
  Object.assign({}, collection, {
    id: collection.id,
    displayName: collectionConfig.displayName,
    groups: collectionConfig.groups
  });

const populateDraftArticles = (collection: CollectionWithNestedArticles) =>
  !collection.draft ? collection.live : collection.draft;

const isFrontStale = (lastUpdated?: number, lastPressed?: number) => {
  if (lastUpdated && lastPressed) {
    return lastUpdated - lastPressed > detectPressFailureMs;
  }
  return false;
};

export {
  getFrontCollections,
  combineCollectionWithConfig,
  populateDraftArticles,
  isFrontStale
};
