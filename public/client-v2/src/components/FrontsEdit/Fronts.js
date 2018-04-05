// @flow

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { Match } from 'react-router-dom';
import filterFrontsByPriority from '../../util/filterFrontsByPriority';
import getFrontsConfig from '../../actions/FrontsConfig';
import type { FrontDetail, FrontsConfig } from '../../types/Fronts';
import type { State } from '../../types/State';

type FrontsComponentProps = {
  match: Match,
  frontsActions: Object,
  frontsConfig: FrontsConfig
};

type ComponentState = {
  selectedFront: ?string
};

class Fronts extends React.Component<FrontsComponentProps, ComponentState> {
  state = {
    selectedFront: null
  };

  componentDidMount() {
    this.props.frontsActions.getFrontsConfig();
  }

  renderSelectPrompt = () => {
    if (!this.state.selectedFront) {
      return <option value="">Choose a front...</option>;
    }
    return null;
  };

  renderFrontOption = (front: FrontDetail) => (
    <option value={front.id} key={front.id}>
      {front.id}
    </option>
  );

  render() {
    if (!this.props.frontsConfig.fronts) {
      return <div>Loading</div>;
    }

    const { match: { params: { priority } } } = this.props;
    const filteredFronts: Array<FrontDetail> = filterFrontsByPriority(
      this.props.frontsConfig,
      priority
    );

    return (
      <select
        value={this.state.selectedFront || ''}
        onChange={e => {
          this.setState({ selectedFront: e.target.value });
        }}
      >
        {this.renderSelectPrompt()}
        {filteredFronts.map(this.renderFrontOption)};
      </select>
    );
  }
}

const mapStateToProps = ({ frontsConfig }: State) => ({
  frontsConfig
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

export default connect(mapStateToProps, mapDispatchToProps)(Fronts);
