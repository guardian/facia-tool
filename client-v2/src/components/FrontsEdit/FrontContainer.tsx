import React from 'react';
import { connect } from 'react-redux';
import startCase from 'lodash/startCase';
import { styled } from 'constants/theme';
import { Dispatch } from 'types/Store';
import { fetchLastPressed } from 'actions/Fronts';
import { updateCollection, closeCollections } from 'actions/Collections';
import { editorCloseFront } from 'bundles/frontsUIBundle';
import Button from 'shared/components/input/ButtonDefault';
import { frontStages } from 'constants/fronts';
import { FrontConfig } from 'types/FaciaApi';
import { State } from 'types/State';
import { AlsoOnDetail } from 'types/Collection';
import { getFront, createAlsoOnSelector } from 'selectors/frontsSelectors';
import Front from './Front';
import SectionHeader from '../layout/SectionHeader';
import SectionContent from '../layout/SectionContent';
import { CollectionItemSets, Collection } from 'shared/types/Collection';
import { toTitleCase } from 'util/stringUtils';
import { RadioButton, RadioGroup } from 'components/inputs/RadioButtons';
import ButtonRoundedWithLabel from 'shared/components/input/ButtonRoundedWithLabel';
import { DownCaretIcon } from 'shared/components/icons/Icons';
import { theme as sharedTheme } from 'shared/constants/theme';

const FrontHeader = styled(SectionHeader)`
  display: flex;
  border-right: 1px solid #767676;
`;

const FrontHeaderMeta = styled('div')`
  display: flex;
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
  color: ${({ theme }) => theme.shared.colors.blackDark};
`;

const SectionContentMetaContainer = styled('div')`
  display: flex;
  flex-shrink: 0;
  justify-content: flex-end;
  margin-bottom: 10px;
`;

const StageSelectButtons = styled('div')`
  color: ${({ theme }) => theme.shared.colors.blackDark};
  padding: 0px 30px;
`;

const CollapseAllButton = styled(ButtonRoundedWithLabel)`
  & svg {
    transform: rotate(180deg);
    vertical-align: middle;
  }
  :hover {
    background-color: ${({ theme }) =>
      theme.shared.base.colors.backgroundColorFocused};
  }
`;

const FrontsContainer = styled('div')`
  height: 100%;
  transform: translate3d(0, 0, 0);
`;

interface FrontsContainerProps {
  frontId: string;
}

type FrontsComponentProps = FrontsContainerProps & {
  selectedFront: FrontConfig;
  alsoOn: { [id: string]: AlsoOnDetail };
  frontsActions: {
    fetchLastPressed: (frontId: string) => void;
    editorCloseFront: (frontId: string) => void;
    updateCollection: (collection: Collection) => void;
    closeAllCollections: (collections: string[]) => void;
  };
};

interface ComponentState {
  collectionSet: CollectionItemSets;
}

class Fronts extends React.Component<FrontsComponentProps, ComponentState> {
  public state = {
    collectionSet: frontStages.draft
  };

  public handleCollectionSetSelect(key: string) {
    this.setState({
      collectionSet: frontStages[key]
    });
  }

  public handleRemoveFront = () => {
    this.props.frontsActions.editorCloseFront(this.props.frontId);
  };

  public render() {
    return (
      <FrontsContainer>
        <>
          <FrontHeader greyHeader={true}>
            <FrontsHeaderText>
              {this.props.selectedFront &&
                startCase(this.props.selectedFront.id)}
            </FrontsHeaderText>
            <FrontHeaderMeta>
              <a
                href={`https://preview.gutools.co.uk/responsive-viewer/https://preview.gutools.co.uk/${
                  this.props.frontId
                }`}
                target="preview"
              >
                <Button size="l">Preview</Button>
              </a>
              <StageSelectButtons>
                <RadioGroup>
                  {Object.keys(frontStages).map(key => (
                    <RadioButton
                      inline
                      key={key}
                      name="frontStages"
                      checked={frontStages[key] === this.state.collectionSet}
                      onChange={() => this.handleCollectionSetSelect(key)}
                      label={toTitleCase(frontStages[key])}
                    />
                  ))}
                </RadioGroup>
              </StageSelectButtons>
              <Button onClick={this.handleRemoveFront} size="l">
                Close
              </Button>
            </FrontHeaderMeta>
          </FrontHeader>
        </>
        <SectionContent direction="column">
          <SectionContentMetaContainer>
            <CollapseAllButton
              onClick={e => {
                e.preventDefault();
                this.props.frontsActions.closeAllCollections(
                  this.props.selectedFront.collections
                );
              }}
              icon={<DownCaretIcon fill={sharedTheme.base.colors.text} />}
              label={'Collapse all'}
            />
          </SectionContentMetaContainer>
          {this.props.selectedFront && (
            <Front
              id={this.props.frontId}
              alsoOn={this.props.alsoOn}
              collectionIds={this.props.selectedFront.collections}
              browsingStage={this.state.collectionSet}
            />
          )}
        </SectionContent>
      </FrontsContainer>
    );
  }
}

const createMapStateToProps = () => {
  const alsoOnSelector = createAlsoOnSelector();
  return (state: State, props: FrontsContainerProps) => ({
    selectedFront: getFront(state, props.frontId),
    alsoOn: alsoOnSelector(state, props.frontId)
  });
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  frontsActions: {
    fetchLastPressed: (id: string) => dispatch(fetchLastPressed(id)),
    updateCollection: (collection: Collection) =>
      dispatch(updateCollection(collection)),
    editorCloseFront: (id: string) => dispatch(editorCloseFront(id)),
    closeAllCollections: (collections: string[]) =>
      dispatch(closeCollections(collections))
  }
});

export { Fronts as FrontsComponent };
export { FrontsComponentProps };

export default connect(
  createMapStateToProps,
  mapDispatchToProps
)(Fronts);
