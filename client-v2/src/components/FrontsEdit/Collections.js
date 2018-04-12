// @flow

import React from 'react';

import type { ConfigCollectionDetail } from '../../types/Fronts';

type Props = {
  collections: Array<ConfigCollectionDetail>
};

const renderCollection = (
  collection: ConfigCollectionDetail,
  index: number
) => <div key={index}>{collection.displayName}</div>;

const Collections = (props: Props) => (
  <div>
    {props.collections.map((collection, index) =>
      renderCollection(collection, index)
    )}{' '}
  </div>
);

export default Collections;
