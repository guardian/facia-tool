// @flow

import React from 'react';
import type { Match } from 'react-router-dom';
import Fronts from './Fronts';

type Props = {
  match: Match
};

const FrontsEdit = (props: Props) => (
  <Fronts priority={props.match.params.priority || ''} />
);

export default FrontsEdit;
