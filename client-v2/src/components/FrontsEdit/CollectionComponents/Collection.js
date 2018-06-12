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

const getArticleFragmentLengths = <T: { articleFragments: Array<*> }>(
  acc: Array<[T, number]> | [],
  group: T,
  i: number
): Array<[T, number]> => {
  const [{ articleFragments }, offset] = acc[i - 1] || [
    { articleFragments: [] },
    0
  ];
  return [...acc, [group, articleFragments.length + offset]];
};

const Collection = ({ id, groups, children, alsoOn }: CollectionProps) => (
  <CollectionDisplay id={id}>
    <AlsoOnNotification alsoOn={alsoOn[id]} />
    <div style={{ marginLeft: 10 }}>
      {groups
        .reduce(getArticleFragmentLengths, [])
        .map(([group, offset]) => (
          <React.Fragment key={group.id}>
            {children(group, offset)}
          </React.Fragment>
        ))}
    </div>
  </CollectionDisplay>
);

export default Collection;
