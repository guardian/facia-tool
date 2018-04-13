// @flow

import type {
  FrontDetail,
  ConfigCollection,
  ConfigCollectionDetailWithId
} from '../types/Fronts';

const getFrontCollections = (
  frontId: ?string,
  fronts: Array<FrontDetail>,
  collections: ConfigCollection
): Array<ConfigCollectionDetailWithId> => {
  if (!frontId) {
    return [];
  }
  const selectedFront: ?FrontDetail = fronts.find(
    (front: FrontDetail) => front.id === frontId
  );

  if (selectedFront) {
    return selectedFront.collections.map(collectionId =>
      Object.assign({}, collections[collectionId], { id: collectionId })
    );
  }

  return [];
};

export { getFrontCollections };
