// @flow

import React from 'react';
import * as Guration from 'guration';
import Article from 'shared/components/Article';
import Children from './Children';

type ArticleFragmentProps = {
  id: string,
  uuid: string,
  index: number,
  meta: {
    supporting: Array<*>
  },
  children: *
};

const ArticleFragment = ({
  uuid,
  index,
  meta,
  children
}: ArticleFragmentProps) => (
  <Guration.Node type="articleFragment" id={uuid} index={index}>
    {getDragProps => (
      <Article id={uuid} {...getDragProps()}>
        <Children
          childrenKey="meta.supporting"
          type="articleFragment"
          childArray={(meta || {}).supporting || []}
        >
          {children}
        </Children>
      </Article>
    )}
  </Guration.Node>
);

export default ArticleFragment;
