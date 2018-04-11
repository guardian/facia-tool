// @flow

import * as React from 'react';
import { connect } from 'react-redux';
import type { Match } from 'react-router-dom';
import FrontsLayout from '../FrontsLayout';
import Fronts from './Fronts';
import Feed from '../Feed';
import ErrorBannner from '../ErrorBanner';
import type { State } from '../../types/State';
import type { ActionError } from '../../types/Action';

type Props = {
  match: Match,
  error: ActionError
};

const FrontsEdit = (props: Props) => (
  <React.Fragment>
    <ErrorBannner error={props.error} />
    <FrontsLayout
      left={<Feed />}
      right={<Fronts priority={props.match.params.priority || ''} />}
    />
  </React.Fragment>
);

const mapStateToProps = (state: State) => ({
  error: state.error
});

export default connect(mapStateToProps)(FrontsEdit);
