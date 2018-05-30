// @flow

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router';

import getFrontsConfig, {
  getCollectionsAndArticles
} from 'actions/FrontsConfig';
import { frontStages } from 'constants/fronts';
import Collection from 'shared/components/Collection';
import type { FrontConfig } from 'types/FaciaApi';
import type { State } from 'types/State';
import { getFront } from 'selectors/frontsSelectors';
import FrontsDropDown from 'containers/FrontsDropdown';
import type { PropsBeforeFetch } from './FrontsContainer';

import Button from '../Button';
import Col from '../Col';
import Row from '../Row';

type FrontsComponentProps = PropsBeforeFetch & {
  selectedFront: FrontConfig,
  frontsActions: {
    getCollectionsAndArticles: (collectionIds: string[]) => Promise<void>,
    getFrontsConfig: () => Promise<void>
  }
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

  componentWillReceiveProps(nextProps: FrontsComponentProps) {
    if (nextProps.selectedFront) {
      nextProps.frontsActions.getCollectionsAndArticles(
        nextProps.selectedFront.collections
      );
    }
  }

  handleStageSelect(key: string) {
    this.setState({
      browsingStage: frontStages[key]
    });
  }

  render() {
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
        {this.props.selectedFront &&
          this.props.selectedFront.isHidden && <div>This front is hidden</div>}
        {this.props.selectedFront &&
          this.props.selectedFront.collections.map(id => (
            <Row key={id}>
              <Collection id={id} stage={this.state.browsingStage} />
            </Row>
          ))}
      </div>
    );
  }
}

const mapStateToProps = (state: State, props: PropsBeforeFetch) => ({
  selectedFront: getFront(state, props.frontId)
});

const mapDispatchToProps = (dispatch: *) => ({
  frontsActions: bindActionCreators(
    {
      getFrontsConfig,
      getCollectionsAndArticles
    },
    dispatch
  )
});

export { Fronts as FrontsComponent };
export type { FrontsComponentProps };

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Fronts));
