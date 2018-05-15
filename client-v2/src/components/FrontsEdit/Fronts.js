// @flow

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router';
import getFrontsConfig from 'actions/FrontsConfig';
import {
  frontsConfigSelector,
  collectionConfigsSelector
} from 'selectors/frontsSelectors';
import { frontStages } from 'constants/fronts';
import type { FrontConfig, CollectionConfig } from 'services/faciaApi';
import type { State } from 'types/State';
import FrontsDropDown from './FrontsDropdown';
import Button from '../Button';
import Col from '../Col';
import Row from '../Row';
import type { PropsBeforeFetch } from './FrontsContainer';

type FrontsComponentProps = PropsBeforeFetch & {
  frontsConfig: {
    fronts: FrontConfig[],
    collections: {
      [string]: CollectionConfig
    }
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

  componentWillReceiveProps() {
    Object.keys(this.props.frontsConfig.collections).forEach(collectionId =>
      this.props.frontsActions.getFrontCollection(collectionId).then(() => {
        this.props.frontsActions.getArticlesForCollection(
          this.props.collection
        );
      })
    );
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
      </div>
    );
  }
}

const mapStateToProps = (state: State, props: PropsBeforeFetch) => ({
  frontsConfig: frontsConfigSelector(state, { priority: props.priority }),
  frontsCollectionConfigs: collectionConfigsSelector(state, {
    frontId: props.frontId
  })
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
