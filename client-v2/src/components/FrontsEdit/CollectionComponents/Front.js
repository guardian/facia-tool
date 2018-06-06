// @flow

import React, { type Node as ReactNode } from 'react';
import * as Guration from 'guration';
import { type Collection } from 'shared/types/Collection';

type FrontProps = {
  collections: Collection[],
  children: (child: Collection, i: number) => ReactNode
};

const Front = ({ collections, children }: FrontProps) => (
  <Guration.Children childrenKey="collections" type="collection">
    {collections.map((child, i) => (
      <React.Fragment key={child.id}>{children(child, i)}</React.Fragment>
    ))}
  </Guration.Children>
);

export default Front;
