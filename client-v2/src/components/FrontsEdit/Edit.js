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
import PressFailAlert from '../PressFailAlert';
import Clipboard from '../Clipboard';

type Props = {
  match: Match,
  error: ActionError,
  history: RouterHistory,
  staleFronts: { string: boolean }
};

const getFrontId = (frontId: ?string): string =>
  frontId ? decodeURIComponent(frontId) : '';

const FrontsEdit = (props: Props) => (
  <React.Fragment>
    <ErrorBannner error={props.error} />
    <PressFailAlert staleFronts={props.staleFronts} />
    <FrontsLayout
      left={<Feed />}
      middle={<Clipboard />}
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
  error: state.error,
  staleFronts: state.staleFronts
});

export default connect(mapStateToProps)(FrontsEdit);
