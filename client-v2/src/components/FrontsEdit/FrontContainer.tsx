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
import { FrontSectionHeader } from '../layout/SectionHeader';
import SectionContent from '../layout/SectionContent';
import { CollectionItemSets, Collection } from 'shared/types/Collection';
import { toTitleCase } from 'util/stringUtils';
import { RadioButton, RadioGroup } from 'components/inputs/RadioButtons';

const FrontHeader = styled(FrontSectionHeader)`
  display: flex;
`;

const FrontHeaderMeta = styled('div')`
  position: relative;
  margin-left: auto;
  font-family: TS3TextSans;
  font-size: 14px;
  white-space: nowrap;
  display: flex;
`;

const FrontsHeaderText = styled('span')`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${({ theme }) => theme.shared.colors.blackDark};
`;

const LastPressedContainer = styled('span')`
  font-size: 10px;
  margin-bottom: 10px;
`;

const StageSelectButtons = styled('div')`
  color: ${({ theme }) => theme.shared.colors.blackDark};
  padding: 0px 30px;
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
              <a
                href={`https://preview.gutools.co.uk/responsive-viewer/https://preview.gutools.co.uk/${
                  this.props.frontId
                }`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="l">Preview</Button>
              </a>
              <StageSelectButtons>
                <RadioGroup>
                  {Object.keys(collectionItemSets).map(key => (
                    <RadioButton
                      inline
                      checked={
                        collectionItemSets[key] === this.state.collectionSet
                      }
                      onChange={() => this.handleCollectionSetSelect(key)}
                      label={toTitleCase(collectionItemSets[key])}
                    />
                  ))}
                </RadioGroup>
              </StageSelectButtons>
              <Button onClick={this.handleRemoveFront} size="l">
                Close
              </Button>
            </FrontHeaderMeta>
          </FrontHeader>
        </React.Fragment>
        <SectionContent direction="column">
          <LastPressedContainer>
            {this.props.lastPressed &&
              `Last refreshed ${distanceInWords(
                new Date(this.props.lastPressed),
                Date.now()
              )} ago`}
          </LastPressedContainer>
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
