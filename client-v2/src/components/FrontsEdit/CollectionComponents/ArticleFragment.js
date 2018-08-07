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
        <DropZone {...props} hoist color="rgba(0,0,0,0.08)" />
      )}
    >
      {children}
    </Guration.Level>
  </Article>
);

export default ArticleFragment;
