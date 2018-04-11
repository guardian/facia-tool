// @flow

import React from 'react';
import type { Match, RouterHistory } from 'react-router-dom';
import FrontsLayout from '../FrontsLayout';
import FrontsContainer from './FrontsContainer';
import Feed from '../Feed';

type Props = {
  match: Match,
  history: RouterHistory
};

const FrontsEdit = (props: Props) => (
  <FrontsLayout
    left={<Feed />}
    right={
      <FrontsContainer
        history={props.history}
        priority={props.match.params.priority || ''}
        frontId={props.match.params.frontId || ''}
      />
    }
  />
);

export default FrontsEdit;
