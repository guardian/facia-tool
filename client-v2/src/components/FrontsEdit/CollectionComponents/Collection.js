// @flow

import React from 'react';
import CollectionDisplay from 'shared/components/Collection';
import AlsoOnNotification from 'components/AlsoOnNotification';
import type { AlsoOnDetail } from 'types/Collection';

type CollectionProps = {
  id: string,
  groups: *,
  children: *,
  alsoOn: { [string]: AlsoOnDetail }
};

const Collection = ({ id, groups, children, alsoOn }: CollectionProps) => (
  <CollectionDisplay id={id}>
    <AlsoOnNotification alsoOn={alsoOn[id]} />
    <div style={{ marginLeft: 10 }}>
      {groups.map(child => (
        <React.Fragment key={child.id}>{children(child)}</React.Fragment>
      ))}
    </div>
  </CollectionDisplay>
);

export default Collection;
