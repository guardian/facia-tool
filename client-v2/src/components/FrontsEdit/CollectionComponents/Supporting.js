// @flow

import React from 'react';
import Article from 'shared/components/Article';

type SupportingProps = {
  uuid: string,
  getDragProps: *
};

const Supporting = ({ uuid, getDragProps }: SupportingProps) => (
  <Article id={uuid} {...getDragProps()} />
);

export default Supporting;
