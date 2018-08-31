// @flow

import React from 'react';
import Article from 'shared/components/Article';

type SupportingProps = {
  uuid: string,
  getNodeProps: *
};

const Supporting = ({ uuid, getNodeProps }: SupportingProps) => (
  <Article id={uuid} {...getNodeProps()} size="small" />
);

export default Supporting;
