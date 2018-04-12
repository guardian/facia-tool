// @flow

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router';
import getFrontsConfig from '../../actions/FrontsConfig';
import { GetFrontsConfigStateSelector } from '../../selectors/frontsSelectors';
import Collections from './Collections';
import type { FrontDetail, FrontsClientConfig } from '../../types/Fronts';
import type { State } from '../../types/State';
import type { PropsBeforeFetch } from './FrontsContainer';

type FrontsComponentProps = PropsBeforeFetch & {
  frontsConfig: FrontsClientConfig,
  frontsActions: Object
};

class Fronts extends React.Component<FrontsComponentProps> {

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
    // TODO assign consts from props
    if (
      !this.props.frontsConfig.fronts ||
      this.props.frontsConfig.fronts.length === 0
    ) {
      return <div>Loading</div>;
    }

    const { frontsConfig: { fronts } } = this.props;

    return (
      <div>
        <select
          value={this.props.frontId}
          onChange={e => this.selectFront(e.target.value)}
        >
          {this.renderSelectPrompt()}
          {fronts.map(this.renderFrontOption)};
        </select>
        <Collections
          collections={getFrontCollections(
            this.props.frontId,
            fronts,
            this.props.frontsConfig.collections
          )}
        />
      </div>
    );
  }
}

const mapStateToProps = (state: State, props: PropsBeforeFetch) => ({
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
