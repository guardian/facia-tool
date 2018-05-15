// @flow

import type { FrontConfig, CollectionConfig } from 'services/faciaApi';

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

export { getFrontCollections };
