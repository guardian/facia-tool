// @flow

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router';
import type { RouterHistory } from 'react-router-dom';
import getFrontsConfig from 'actions/FrontsConfig';
import { frontsIdsSelector } from 'selectors/frontsSelectors';
import type { State } from 'types/State';
import Fronts from './Fronts';

type PropsBeforeFetch = {
  priority: string, // eslint-disable-line react/no-unused-prop-types
  history: RouterHistory,
  frontId: string
};

type Props = PropsBeforeFetch & {
  frontsIds: Array<string>,
  frontsActions: Object
};

class FrontsContainer extends React.Component<Props> {
  componentDidMount() {
    this.props.frontsActions.getFrontsConfig().then(() => {
      if (this.props.frontId) {
        const {
          props: { frontId }
        } = this;
        if (!this.props.frontsIds.includes(frontId)) {
          this.props.history.push(`/${this.props.priority}`);
        }
      }
    });
  }

  render() {
    return (
      <Fronts
        priority={this.props.priority}
        history={this.props.history}
        frontId={this.props.frontId}
      />
    );
  }
}

const mapStateToProps = (state: State, props: PropsBeforeFetch) => ({
  frontsIds: frontsIdsSelector(state, props.priority)
});

const mapDispatchToProps = (dispatch: *) => ({
  frontsActions: bindActionCreators(
    {
      getFrontsConfig
    },
    dispatch
  )
});

export type { PropsBeforeFetch };

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(FrontsContainer)
);
