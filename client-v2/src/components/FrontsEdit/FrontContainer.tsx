import React from 'react';
import { connect } from 'react-redux';
import distanceInWords from 'date-fns/distance_in_words';
import startCase from 'lodash/startCase';
import { styled } from 'constants/theme';
import { Dispatch } from 'types/Store';
import { fetchLastPressed } from 'actions/Fronts';
import { updateCollection } from 'actions/Collections';
import { editorCloseFront } from 'bundles/frontsUIBundle';
import Button from 'shared/components/input/ButtonDefault';
import { collectionItemSets } from 'constants/fronts';
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
import { CollectionItemSets, Collection } from 'shared/types/Collection';

const FrontHeader = styled(SectionHeader)`
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
  font-size: 10px;
`;

interface FrontsContainerProps {
  frontId: string;
}

type FrontsComponentProps = FrontsContainerProps & {
  selectedFront: FrontConfig;
  alsoOn: { [id: string]: AlsoOnDetail };
  lastPressed: string | null;
  frontsActions: {
    fetchLastPressed: (frontId: string) => void;
    editorCloseFront: (frontId: string) => void;
  };
};

interface ComponentState {
  collectionSet: CollectionItemSets;
}

class Fronts extends React.Component<FrontsComponentProps, ComponentState> {
  public state = {
    collectionSet: collectionItemSets.draft
  };

  public componentDidMount() {
    if (!this.props.lastPressed) {
      this.props.frontsActions.fetchLastPressed(this.props.frontId);
    }
  }

  public handleCollectionSetSelect(key: string) {
    this.setState({
      collectionSet: collectionItemSets[key]
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
              {Object.keys(collectionItemSets).map(key => (
                <Button
                  key={key}
                  size="l"
                  selected={
                    collectionItemSets[key] === this.state.collectionSet
                  }
                  onClick={() => this.handleCollectionSetSelect(key)}
                >
                  {collectionItemSets[key]}
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
              browsingStage={this.state.collectionSet}
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
