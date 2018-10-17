import React from 'react';
import { connect } from 'react-redux';
import distanceInWords from 'date-fns/distance_in_words';
import startCase from 'lodash/startCase';
import styled from 'styled-components';
import { Dispatch } from 'types/Store';

import { fetchLastPressed } from 'actions/Fronts';
import {
  getCollectionsAndArticles,
  updateCollection
} from 'actions/Collections';
import { editorCloseFront } from 'bundles/frontsUIBundle';
import Button from 'shared/components/input/ButtonDefault';
import { frontStages } from 'constants/fronts';
import { FrontConfig } from 'types/FaciaApi';
import { State } from 'types/State';
import { AlsoOnDetail } from 'types/Collection';
import {
  getFront,
  createAlsoOnSelector,
  lastPressedSelector
} from 'selectors/frontsSelectors';
import Front from './Front';
import SectionHeader from '../layout/SectionHeader';
import SectionContent from '../layout/SectionContent';
import { Stages, Collection } from 'shared/types/Collection';

const FrontHeader = SectionHeader.extend`
  display: flex;
`;

const FrontHeaderMeta = styled('span')`
  position: relative;
  margin-left: auto;
  font-family: TS3TextSans;
  font-size: 14px;
  white-space: nowrap;
`;

const FrontsHeaderText = styled('span')`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LastPressedContainer = styled('span')`
  margin-right: 6px;
`;

interface FrontsContainerProps {
  frontId: string;
}

type FrontsComponentProps = FrontsContainerProps & {
  selectedFront: FrontConfig;
  alsoOn: { [id: string]: AlsoOnDetail };
  lastPressed: string | null;
  frontsActions: {
    getCollectionsAndArticles: (collectionIds: string[]) => Promise<void[]>;
    fetchLastPressed: (frontId: string) => void;
    editorCloseFront: (frontId: string) => void;
  };
};

interface ComponentState {
  browsingStage: Stages;
}

class Fronts extends React.Component<FrontsComponentProps, ComponentState> {
  public state = {
    browsingStage: frontStages.draft
  };

  public componentDidMount() {
    // If we've already got the front configuration, fetch
    // collections and articles immediately.
    if (this.props.selectedFront) {
      this.props.frontsActions.getCollectionsAndArticles(
        this.props.selectedFront.collections
      );
    }
  }

  public componentWillReceiveProps(nextProps: FrontsComponentProps) {
    if (this.props.frontId !== nextProps.frontId || !this.props.lastPressed) {
      this.props.frontsActions.fetchLastPressed(nextProps.frontId);
    }
    // If we mounted without a front configuration,
    // fetch it when it's eventually available.
    if (!this.props.selectedFront && nextProps.selectedFront) {
      nextProps.frontsActions.getCollectionsAndArticles(
        nextProps.selectedFront.collections
      );
    }
  }

  public handleStageSelect(key: string) {
    this.setState({
      browsingStage: frontStages[key]
    });
  }

  public handleRemoveFront = () => {
    this.props.frontsActions.editorCloseFront(this.props.frontId);
  };

  public render() {
    return (
      <>
        <React.Fragment>
          <FrontHeader>
            <FrontsHeaderText>
              {this.props.selectedFront &&
                startCase(this.props.selectedFront.id)}
            </FrontsHeaderText>
            <FrontHeaderMeta>
              <LastPressedContainer>
                {this.props.lastPressed &&
                  `Last refreshed ${distanceInWords(
                    new Date(this.props.lastPressed),
                    Date.now()
                  )} ago`}
              </LastPressedContainer>
              &nbsp;
              <Button onClick={this.handleRemoveFront} size="l">
                Remove
              </Button>
              <a
                href={`https://preview.gutools.co.uk/responsive-viewer/https://preview.gutools.co.uk/${
                  this.props.frontId
                }`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="l">Preview</Button>
              </a>
              {Object.keys(frontStages).map(key => (
                <Button
                  key={key}
                  size="l"
                  selected={frontStages[key] === this.state.browsingStage}
                  onClick={() => this.handleStageSelect(key)}
                >
                  {frontStages[key]}
                </Button>
              ))}
            </FrontHeaderMeta>
          </FrontHeader>
        </React.Fragment>
        <SectionContent>
          {this.props.selectedFront && (
            <Front
              id={this.props.frontId}
              alsoOn={this.props.alsoOn}
              collectionIds={this.props.selectedFront.collections}
              browsingStage={this.state.browsingStage}
            />
          )}
        </SectionContent>
      </>
    );
  }
}

const createMapStateToProps = () => {
  const alsoOnSelector = createAlsoOnSelector();
  return (state: State, props: FrontsContainerProps) => ({
    selectedFront: getFront(state, props.frontId),
    alsoOn: alsoOnSelector(state, props.frontId),
    lastPressed: lastPressedSelector(state, props.frontId)
  });
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  frontsActions: {
    getCollectionsAndArticles: (ids: string[]) =>
      dispatch(getCollectionsAndArticles(ids)),
    fetchLastPressed: (id: string) => dispatch(fetchLastPressed(id)),
    updateCollection: (collection: Collection) =>
      dispatch(updateCollection(collection)),
    editorCloseFront: (id: string) => dispatch(editorCloseFront(id))
  }
});

export { Fronts as FrontsComponent };
export { FrontsComponentProps };

export default connect(
  createMapStateToProps,
  mapDispatchToProps
)(Fronts);
