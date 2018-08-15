// @flow

import React from 'react';
import * as Guration from '@guardian/guration';
import Article from 'shared/components/Article';
import DropZone from 'components/DropZone';

type ArticleFragmentProps = {
  uuid: string,
  meta: {
    supporting: *
  },
  children: *,
  getDragProps: () => Object
};

// We hoist the drop zone into the rendered element here,
// to prevent it from introducing gaps between supporting
// articles.
const dropIndicatorStyle = {
  marginLeft: '83px'
};

const dropZoneStyle = {
  marginTop: '-15px',
  padding: '3px'
};

const ArticleFragment = ({
  uuid,
  meta: { supporting = [] } = {},
  children,
  getDragProps
}: ArticleFragmentProps) => (
  <Article id={uuid} {...getDragProps()}>
    <Guration.Level
      arr={supporting}
      type="articleFragment"
      getKey={({ uuid: key }) => key}
      renderDrop={props => (
        <DropZone
          {...props}
          style={dropZoneStyle}
          indicatorStyle={dropIndicatorStyle}
        />
      )}
    >
      {children}
    </Guration.Level>
  </Article>
);

export default ArticleFragment;
