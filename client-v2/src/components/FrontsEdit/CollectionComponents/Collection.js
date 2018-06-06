// @flow

import React, { type Node as ReactNode } from 'react';
import * as Guration from 'guration';
import CollectionDisplay from 'shared/components/Collection';
import AlsoOnNotification from 'components/AlsoOnNotification';
import type { AlsoOnDetail } from 'types/Collection';

type CollectionProps<T> = {
  id: string,
  index: number,
  groups: Array<T>,
  children: (child: T) => ReactNode,
  alsoOn: { [string]: AlsoOnDetail }
};

const Collection = <T: { id: string }>({
  id,
  index,
  groups,
  children,
  alsoOn
}: CollectionProps<T>) => (
  <Guration.Node type="collection" id={id} index={index}>
    <Guration.Dedupe type="articleFragment">
      <CollectionDisplay id={id}>
        <AlsoOnNotification alsoOn={alsoOn[id]} />
        <div style={{ marginLeft: 10 }}>
          {groups.map(child => <div key={child.id}>{children(child)}</div>)}
        </div>
      </CollectionDisplay>
    </Guration.Dedupe>
  </Guration.Node>
);

export default Collection;
