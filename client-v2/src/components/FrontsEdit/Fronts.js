// @flow

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router';
import type { RouterHistory } from 'react-router-dom';
import getFrontsConfig from '../../actions/FrontsConfig';
import { GetFrontsConfigStateSelector } from '../../selectors/frontsSelectors';
import type { FrontDetail, FrontsClientConfig } from '../../types/Fronts';
import type { State } from '../../types/State';

type ComponentPropsBeforeFetch = {
  priority: string, // eslint-disable-line react/no-unused-prop-types
  history: RouterHistory,
  frontId: string
};

type FrontsComponentProps = ComponentPropsBeforeFetch & {
  frontsConfig: FrontsClientConfig,
  frontsActions: Object
};

type ComponentState = {
  selectedFront: ?string
};

class Fronts extends React.Component<FrontsComponentProps, ComponentState> {

  componentDidMount() {
    this.props.frontsActions.getFrontsConfig();
  }

  selectFront = (frontId: string) => {
    const encodedUri = encodeURIComponent(frontId);
    this.props.history.push(`/${this.props.priority}/${encodedUri}`);
  };

  renderFrontOption = (front: FrontDetail) => (
    <option value={front.id} key={front.id}>
      {front.id}
    </option>
  );

  renderSelectPrompt = () => {
    if (!this.props.frontId) {
      return <option value="">Choose a front...</option>;
    }
    return null;
  };

  render() {
    if (!this.props.frontsConfig.fronts) {
      return <div>Loading</div>;
    }

    const { frontsConfig: { fronts } } = this.props;

    return (
      <select
        value={decodeURIComponent(this.props.frontId)}
        onChange={e => this.selectFront(e.target.value)}
      >
        {this.renderSelectPrompt()}
        {fronts.map(this.renderFrontOption)};
      </select>
    );
  }
}

const mapStateToProps = (state: State, props: ComponentPropsBeforeFetch) => ({
  frontsConfig: GetFrontsConfigStateSelector(state, props.priority)
});

const mapDispatchToProps = (dispatch: *) => ({
  frontsActions: bindActionCreators(
    {
      getFrontsConfig
    },
    dispatch
  )
});

export { Fronts as FrontsComponent };
export type { FrontsComponentProps };

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Fronts));
