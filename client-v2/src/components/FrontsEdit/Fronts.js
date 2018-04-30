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
import { frontStages } from '../../constants/fronts';
import Button from '../Button';
import Col from '../Col';
import Row from '../Row';
import type { FrontsClientConfig } from '../../types/FrontsConfig';
import type { State } from '../../types/State';
import type { PropsBeforeFetch } from './FrontsContainer';

type FrontsComponentProps = PropsBeforeFetch & {
  frontsConfig: FrontsClientConfig,
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
    const {
      frontsConfig: { fronts, collections }
    } = this.props;

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
