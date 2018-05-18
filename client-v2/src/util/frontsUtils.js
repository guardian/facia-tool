// @flow

import type { FrontConfig, CollectionConfig } from 'types/FaciaApi';
import type { CollectionWithNestedArticles } from 'shared/types/Collection';

const getFrontCollections = (
  frontId: ?string,
  fronts: Array<FrontConfig>,
  collections: { [string]: CollectionConfig }
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

export {
  getFrontCollections,
  combineCollectionWithConfig,
  populateDraftArticles
};
