import React from 'react';
import { Level } from 'lib/guration';

type FrontProps = {
  collections: any,
  children: any
};

const Front = ({ collections, children }: FrontProps) => (
  <Level arr={collections} type="collection">
    {children}
  </Level>
);

export default Front;
