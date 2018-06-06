// @flow

import React from 'react';
import * as Guration from 'guration';
import GroupDisplay from 'shared/components/GroupDisplay';
import Children from './Children';

type GroupProps = {
  id: string,
  index: number,
  articleFragments: Array<*>,
  children: *
};

const Group = ({ id, index, articleFragments, children }: GroupProps) => (
  <Guration.Field type="group" value={id} index={index}>
    <GroupDisplay groupName={id}>
      <Children
        childrenKey="articleFragments"
        type="articleFragment"
        childArray={articleFragments}
      >
        {children}
      </Children>
    </GroupDisplay>
  </Guration.Field>
);

export default Group;
