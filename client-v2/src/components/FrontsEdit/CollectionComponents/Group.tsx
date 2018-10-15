import React from 'react';
import * as Guration from 'lib/guration';
import GroupDisplay from 'shared/components/GroupDisplay';
import DropZone from 'components/DropZone';
import ArticleDrag from './ArticleDrag';

type GroupProps = {
  id: string;
  articleFragments: any;
  children: any;
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
      renderDrag={(e: any) => <ArticleDrag id={e.uuid} />}
    >
      {children}
    </Guration.Level>
  </GroupDisplay>
);

export default Group;
