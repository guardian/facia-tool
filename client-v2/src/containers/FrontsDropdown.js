// @flow

import * as React from 'react';
import { connect } from 'react-redux';
import { type Match, type RouterHistory, withRouter } from 'react-router';
import { type State } from '../types/State';
import Dropdown, { type DropdownProps } from '../components/inputs/Dropdown';
import { getFrontsWithPriority } from '../selectors/frontsSelectors';

const frontPath = (priority: string, frontId: string) =>
  `/${priority}/${encodeURIComponent(frontId)}`;

type Props = {
  match: Match,
  history: RouterHistory
};

const mapStateToProps = (state: State, props: Props): DropdownProps => ({
  current:
    props.match.params.priority && props.match.params.frontId
      ? frontPath(
          props.match.params.priority,
          decodeURIComponent(props.match.params.frontId)
        )
      : null,
  items: getFrontsWithPriority(state, props.match.params.priority || '').map(
    ({ id, priority }) => ({
      value: frontPath(priority, id),
      label: id
    })
  ),
  deselectValue: '@@NONE',
  deselectText: 'Choose a front',
  onChange: value =>
    value === '@@NONE'
      ? props.history.push(`/${props.match.params.priority || ''}`)
      : props.history.push(value)
});

export default withRouter(
  // $FlowFixMe: flow doesn't play nice with double HOCs
  (connect(mapStateToProps)(Dropdown): React.ComponentType<Props>)
);
