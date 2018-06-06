// @flow

import React from 'react';
import * as Guration from 'guration';
import Article from 'shared/components/Article';

type SupportingProps = {
  uuid: string,
  index: number
};

const Supporting = ({ uuid, index }: SupportingProps) => (
  <Guration.Node type="articleFragment" id={uuid} index={index}>
    {getDragProps => <Article id={uuid} {...getDragProps()} />}
  </Guration.Node>
);

export default Supporting;
