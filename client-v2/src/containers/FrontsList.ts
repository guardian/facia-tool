

import * as React from 'react';
import { connect } from 'react-redux';
import { type Match, type RouterHistory, withRouter } from 'react-router';

import { selectEditorFronts } from 'bundles/frontsUIBundle';
import { type State } from '../types/State';
import FrontList from '../components/FrontList';
import { getFrontsWithPriority } from '../selectors/frontsSelectors';

type Props = {
  match: Match,
  history: RouterHistory
};

const mapStateToProps = (state: State, props: Props) => {
  const openFrontIds = selectEditorFronts(state);
  return {
    fronts: getFrontsWithPriority(state, props.match.params.priority || '').map(
      ({ id }) => ({
        id,
        isOpen: openFrontIds.indexOf(id) === -1
      })
    )
  };
};

export default withRouter(
  // $FlowFixMe: flow doesn't play nice with double HOCs
  (connect(mapStateToProps)(FrontList): React.ComponentType<Props>)
);
