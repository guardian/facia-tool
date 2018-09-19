// @flow

import React from 'react';
import { Level } from 'lib/guration';

type FrontProps = {
  collections: *,
  children: *
};

const Front = ({ collections, children }: FrontProps) => (
  <Level arr={collections} type="collection">
    {children}
  </Level>
);

export default Front;
