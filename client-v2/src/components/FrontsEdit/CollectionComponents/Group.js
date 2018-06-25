// @flow

import React from 'react';
import * as Guration from 'guration';
import GroupDisplay from 'shared/components/GroupDisplay';
import DropZone from 'components/DropZone';

type GroupProps = {
  id: string,
  index: number,
  articleFragments: *,
  children: *
};

const Group = ({ id, articleFragments, children }: GroupProps) => (
  <GroupDisplay groupName={id}>
    <Guration.Level
      arr={articleFragments}
      type="articleFragment"
      getKey={({ uuid }) => uuid}
      renderDrop={props => <DropZone {...props} />}
    >
      {children}
    </Guration.Level>
  </GroupDisplay>
);

export default Group;
