// @flow

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router';
import getFrontsConfig from '../../actions/FrontsConfig';
import { GetFrontsConfigStateSelector } from '../../selectors/frontsSelectors';
import CollectionContainer from './CollectionContainer';
import { getFrontCollections } from '../../util/frontsUtils';
import type { FrontDetail, FrontsClientConfig } from '../../types/FrontsConfig';
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
    const { frontsConfig: { fronts, collections } } = this.props;
    if (
      !fronts ||
      fronts.length === 0
    ) {
      return <div>Loading</div>;
    }

    const collectionsWithId = getFrontCollections(
      this.props.frontId,
      fronts,
      collections
    );

    return (
      <div>
        <select
          value={this.props.frontId}
          onChange={e => this.selectFront(e.target.value)}
        >
          {this.renderSelectPrompt()}
          {fronts.map(this.renderFrontOption)};
        </select>
        {collectionsWithId.map(collection => (
          <div key={collection.id}>
            <CollectionContainer collection={collection} />
          </div>
        ))}
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
