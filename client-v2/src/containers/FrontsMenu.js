// @flow

import * as React from 'react';
import { connect } from 'react-redux';
import { type Match, type RouterHistory, withRouter } from 'react-router';
import { type State } from '../types/State';
import FrontList from '../components/FrontList';
import { getFrontsWithPriority } from '../selectors/frontsSelectors';

const frontPath = (priority: string, frontId: string) =>
  `/${priority}/${encodeURIComponent(frontId)}`;

type Props = {
  match: Match,
  history: RouterHistory
};

const mapStateToProps = (state: State, props: Props) => ({
  fronts: getFrontsWithPriority(state, props.match.params.priority || '').map(
    ({ id, priority }) => ({
      value: frontPath(priority, id),
      label: id
    })
  )
});

export default withRouter(
  // $FlowFixMe: flow doesn't play nice with double HOCs
  (connect(mapStateToProps)(FrontList): React.ComponentType<Props>)
);
