// @flow

import React from 'react';

import type { ConfigCollectionDetailWithId, FrontCollectionDetail } from '../../types/Fronts';

type Props = {
  collectionConfig: ConfigCollectionDetailWithId,
  collection: FrontCollectionDetail
};

const CollectionDetail = (props: Props) => (
  <div>
    {props.collectionConfig.displayName}
  </div>
);

export default CollectionDetail;

