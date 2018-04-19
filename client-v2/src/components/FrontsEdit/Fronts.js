// @flow

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router';
import getFrontsConfig from '../../actions/FrontsConfig';
import { GetFrontsConfigStateSelector } from '../../selectors/frontsSelectors';
import CollectionContainer from './CollectionContainer';
import FrontsDropDown from './FrontsDropdown';
import { getFrontCollections } from '../../util/frontsUtils';
import type { FrontsClientConfig } from '../../types/FrontsConfig';
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

  render() {
    const { frontsConfig: { fronts, collections } } = this.props;

    const collectionsWithId = getFrontCollections(
      this.props.frontId,
      fronts,
      collections
    );

    return (
      <div>
        <FrontsDropDown
          fronts={fronts}
          frontId={this.props.frontId}
          history={this.props.history}
          priority={this.props.priority}
        />
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
