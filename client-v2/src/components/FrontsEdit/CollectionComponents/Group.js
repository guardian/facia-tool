// @flow

import React from 'react';
import * as Guration from '@guardian/guration';
import GroupDisplay from 'shared/components/GroupDisplay';
import DropZone from 'components/DropZone';

type GroupProps = {
  id: string,
  index: number,
  articleFragments: *,
  children: *
};

const dropZoneStyle = {
  padding: '3px 0'
};

const Group = ({ id, articleFragments, children }: GroupProps) => (
  <GroupDisplay groupName={id}>
    <Guration.Level
      arr={articleFragments}
      type="articleFragment"
      getKey={({ uuid }) => uuid}
      renderDrop={(getDropProps, { canDrop, isTarget }) => (
        <DropZone
          {...getDropProps()}
          override={!!canDrop && !!isTarget}
          style={dropZoneStyle}
        />
      )}
    >
      {children}
    </Guration.Level>
  </GroupDisplay>
);

export default Group;
