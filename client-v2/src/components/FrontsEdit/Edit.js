// @flow

import * as React from 'react';
import { connect } from 'react-redux';
import type { Match, RouterHistory } from 'react-router-dom';
import type { State } from 'types/State';
import type { ActionError } from 'types/Action';
import FrontsLayout from '../FrontsLayout';
import FrontsContainer from './FrontsContainer';
import Feed from '../Feed';
import ErrorBannner from '../ErrorBanner';

type Props = {
  match: Match,
  error: ActionError,
  history: RouterHistory
};

const getFrontId = (frontId: ?string): string =>
  frontId ? decodeURIComponent(frontId) : '';

const FrontsEdit = (props: Props) => (
  <React.Fragment>
    <ErrorBannner error={props.error} />
    <FrontsLayout
      left={<Feed />}
      right={
        <FrontsContainer
          history={props.history}
          priority={props.match.params.priority || ''}
          frontId={getFrontId(props.match.params.frontId)}
        />
      }
    />
  </React.Fragment>
);

const mapStateToProps = (state: State) => ({
  error: state.error
});

export default connect(mapStateToProps)(FrontsEdit);
