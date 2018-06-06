// @flow

import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router';
import distanceInWords from 'date-fns/distance_in_words';

import getFrontsConfig, {
  getCollectionsAndArticles,
  fetchLastPressed
} from 'actions/Fronts';
import { frontStages } from 'constants/fronts';
// import Collection from 'shared/components/Collection';
import type { FrontConfig } from 'types/FaciaApi';
import type { State } from 'types/State';
import type { AlsoOnDetail } from 'types/Collection';
import {
  getFront,
  createAlsoOnSelector,
  lastPressedSelector
} from 'selectors/frontsSelectors';
import FrontsDropDown from 'containers/FrontsDropdown';
import ScrollContainer from 'components/ScrollContainer';
import type { PropsBeforeFetch } from './FrontsContainer';

import Front from './Front';

import Button from '../Button';
import Col from '../Col';
import Row from '../Row';

type FrontsComponentProps = PropsBeforeFetch & {
  selectedFront: FrontConfig,
  alsoOn: { [string]: AlsoOnDetail },
  lastPressed: string,
  frontsActions: {
    getCollectionsAndArticles: (collectionIds: string[]) => Promise<void>,
    getFrontsConfig: () => Promise<void>,
    fetchLastPressed: (frontId: string) => Promise<void>
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
    if (this.props.frontId !== nextProps.frontId || !this.props.lastPressed) {
      this.props.frontsActions.fetchLastPressed(nextProps.frontId);
    }
  }

  handleStageSelect(key: string) {
    this.setState({
      browsingStage: frontStages[key]
    });
  }

  render() {
    return (
      <ScrollContainer
        fixed={
          <React.Fragment>
            <Row>
              <FrontsDropDown />
            </Row>
            <Row>
              <div>
                {this.props.lastPressed &&
                  `Last refreshed ${distanceInWords(
                    new Date(this.props.lastPressed),
                    Date.now()
                  )} ago`}
              </div>
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
          </React.Fragment>
        }
      >
        {this.props.selectedFront && (
          <Front
            alsoOn={this.props.alsoOn}
            front={this.props.selectedFront}
            browsingStage={this.state.browsingStage}
          />
        )}
      </ScrollContainer>
    );
  }
}

const createMapStateToProps = () => {
  const alsoOnSelector = createAlsoOnSelector();
  // $FlowFixMe
  return (state: State, props: PropsBeforeFetch) => ({
    selectedFront: getFront(state, props.frontId),
    alsoOn: alsoOnSelector(state, props.frontId),
    lastPressed: lastPressedSelector(state, props.frontId)
  });
};

const mapDispatchToProps = (dispatch: *) => ({
  frontsActions: bindActionCreators(
    {
      getFrontsConfig,
      getCollectionsAndArticles,
      fetchLastPressed
    },
    dispatch
  )
});

export { Fronts as FrontsComponent };
export type { FrontsComponentProps };

export default withRouter(
  connect(createMapStateToProps, mapDispatchToProps)(Fronts)
);
