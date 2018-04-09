// @flow

import React from 'react';
import type { Match } from 'react-router-dom';
import FrontsLayout from '../FrontsLayout';
import Fronts from './Fronts';
import Feed from '../Feed';

type Props = {
  match: Match
};

const FrontsEdit = (props: Props) => (
  <FrontsLayout
    left={<Feed />}
    right={<Fronts priority={props.match.params.priority || ''} />}
  />
);

export default FrontsEdit;
