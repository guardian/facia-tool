// @flow

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router';
import getFrontsConfig from 'actions/FrontsConfig';
import { getFrontCollections } from 'util/frontsUtils';
import { frontStages } from 'constants/fronts';
import type { FrontConfig, CollectionConfig } from 'services/faciaApi';
import type { State } from 'types/State';
import {
  getFrontsWithPriority,
  getCollections
} from 'selectors/frontsSelectors';
import FrontsDropDown from 'containers/FrontsDropdown';
import type { PropsBeforeFetch } from './FrontsContainer';
import CollectionContainer from './CollectionContainer';
import Button from '../Button';
import Col from '../Col';
import Row from '../Row';

type FrontsComponentProps = PropsBeforeFetch & {
  fronts: FrontConfig[],
  collections: {
    [string]: CollectionConfig
  },
  frontsActions: Object
};

type ComponentState = {
  browsingStage: 'draft' | 'live'
};

class Fronts extends React.Component<FrontsComponentProps, ComponentState> {
  state = {
    browsingStage: frontStages.draft
  };

  componentDidMount() {
    this.props.frontsActions.getFrontsConfig();
  }

  handleStageSelect(key: string) {
    this.setState({
      browsingStage: frontStages[key]
    });
  }

  render() {
    const { fronts, collections } = this.props;

    const collectionsWithId = getFrontCollections(
      this.props.frontId,
      fronts,
      collections
    );

    return (
      <div>
        <FrontsDropDown />
        <Row>
          {Object.keys(frontStages).map(key => (
            <Col key={key}>
              <Button
                selected={frontStages[key] === this.state.browsingStage}
                onClick={() => this.handleStageSelect(key)}
              >
                {frontStages[key]}
              </Button>
            </Col>
          ))}
        </Row>
        {collectionsWithId.map(collection => (
          <div key={collection.id}>
            <CollectionContainer
              collectionConfig={collection}
              browsingStage={this.state.browsingStage}
            />
          </div>
        ))}
      </div>
    );
  }
}

const mapStateToProps = (state: State, props: PropsBeforeFetch) => ({
  collections: getCollections(state),
  fronts: getFrontsWithPriority(state, props.priority)
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
