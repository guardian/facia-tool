// @flow

import React from 'react';
import { Level } from '@guardian/guration';

type FrontProps = {
  collections: *,
  children: *
};

const Front = ({ collections, children }: FrontProps) => (
  <Level arr={collections} type="collection" dedupeType="articleFragment">
    {children}
  </Level>
);

export default Front;
