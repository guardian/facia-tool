// @flow

import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router';
import distanceInWords from 'date-fns/distance_in_words';
import startCase from 'lodash/startCase';
import styled from 'styled-components';

import getFrontsConfig, { fetchLastPressed } from 'actions/Fronts';
import {
  getCollectionsAndArticles,
  updateCollection
} from 'actions/Collections';
import Button from 'shared/components/input/Button';
import { frontStages } from 'constants/fronts';
import type { FrontConfig } from 'types/FaciaApi';
import type { State } from 'types/State';
import type { AlsoOnDetail } from 'types/Collection';
import {
  getFront,
  createAlsoOnSelector,
  lastPressedSelector
} from 'selectors/frontsSelectors';
import ScrollContainer from 'components/ScrollContainer';
import type { PropsBeforeFetch } from './FrontsContainer';
import Front from './Front';
import BladeHeader from '../layout/BladeHeader';
import BladeContent from '../layout/BladeContent';

const FrontsHeaderMeta = styled('span')`
  position: relative;
  float: right;
  font-family: TS3TextSans;
  font-size: 14px;
`;

const LastPressedContainer = styled('span')`
  margin-right: 6px;
`;

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
            <BladeHeader>
              {this.props.selectedFront &&
                startCase(this.props.selectedFront.id)}
              <FrontsHeaderMeta>
                <LastPressedContainer>
                  {this.props.lastPressed &&
                    `Last refreshed ${distanceInWords(
                      new Date(this.props.lastPressed),
                      Date.now()
                    )} ago`}
                </LastPressedContainer>
                &nbsp;
                {Object.keys(frontStages).map(key => (
                  <Button
                    key={key}
                    selected={frontStages[key] === this.state.browsingStage}
                    onClick={() => this.handleStageSelect(key)}
                  >
                    {frontStages[key]}
                  </Button>
                ))}
              </FrontsHeaderMeta>
            </BladeHeader>
          </React.Fragment>
        }
      >
        <BladeContent>
          {this.props.selectedFront && (
            <Front
              alsoOn={this.props.alsoOn}
              collectionIds={this.props.selectedFront.collections}
              browsingStage={this.state.browsingStage}
            />
          )}
        </BladeContent>
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
      fetchLastPressed,
      updateCollection
    },
    dispatch
  )
});

export { Fronts as FrontsComponent };
export type { FrontsComponentProps };

export default withRouter(
  connect(
    createMapStateToProps,
    mapDispatchToProps
  )(Fronts)
);
