// @flow

import React from 'react';
import * as Guration from '@guardian/guration';
import GroupDisplay from 'shared/components/GroupDisplay';
import DropZone from 'components/DropZone';

type GroupProps = {
  id: string,
  index: number,
  offset: number,
  articleFragments: *,
  children: *
};

const Group = ({
  id,
  index,
  offset,
  articleFragments,
  children
}: GroupProps) => (
  <Guration.Field type="articleFragment" field="group" value={id} index={index}>
    <GroupDisplay groupName={id}>
      <Guration.Level
        arr={articleFragments}
        offset={offset}
        type="articleFragment"
        getKey={({ uuid }) => uuid}
        renderDrop={props => <DropZone {...props} />}
      >
        {children}
      </Guration.Level>
    </GroupDisplay>
  </Guration.Field>
);

export default Group;
