// @flow

import type {
  FrontDetailFull,
  ConfigCollection,
  ConfigCollectionDetailWithId
} from '../types/FrontsConfig';

const getFrontCollections = (
  frontId: ?string,
  fronts: Array<FrontDetailFull>,
  collections: ConfigCollection
): Array<ConfigCollectionDetailWithId> => {
  if (!frontId) {
    return [];
  }
  const selectedFront: ?FrontDetailFull = fronts.find(
    (front: FrontDetailFull) => front.id === frontId
  );

  if (selectedFront) {
    return selectedFront.collections.map(collectionId =>
      Object.assign({}, collections[collectionId], { id: collectionId })
    );
  }

  return [];
};

export { getFrontCollections };
