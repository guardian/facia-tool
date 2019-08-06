import React from 'react';
import { connect } from 'react-redux';
import startCase from 'lodash/startCase';
import { styled } from 'constants/theme';
import { Dispatch } from 'types/Store';
import { fetchLastPressed } from 'actions/Fronts';
import { updateCollection } from 'actions/Collections';
import {
  editorCloseFront,
  selectIsFrontOverviewOpen,
  selectSingleArticleFragmentForm,
  changedBrowsingStage
} from 'bundles/frontsUIBundle';
import Button from 'shared/components/input/ButtonDefault';
import { frontStages } from 'constants/fronts';
import { FrontConfig, EditionsFrontMetadata } from 'types/FaciaApi';
import { State } from 'types/State';
import { AlsoOnDetail } from 'types/Collection';
import {
  selectFront,
  createSelectAlsoOnFronts
} from 'selectors/frontsSelectors';
import Front from './Front';
import SectionHeader from '../layout/SectionHeader';
import SectionContent from '../layout/SectionContent';
import {
  CollectionItemSets,
  Collection,
  Stages
} from 'shared/types/Collection';
import { toTitleCase } from 'util/stringUtils';
import { RadioButton, RadioGroup } from 'components/inputs/RadioButtons';
import { PreviewEyeIcon, ClearIcon } from 'shared/components/icons/Icons';
import { createFrontId } from 'util/editUtils';
import { formMinWidth } from './ArticleFragmentForm';
import EditModeVisibility from 'components/util/EditModeVisibility';
import { updateFrontMetadata } from 'actions/Editions';

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

const FrontsHeaderInput = styled('input')`
  font-size: 22px;
  font-family: GHGuardianHeadline;
  font-weight: bold;
  width: 20em;
`;

const StageSelectButtons = styled('div')`
  color: ${({ theme }) => theme.shared.colors.blackDark};
  padding: 0px 15px;
`;

const SingleFrontContainer = styled('div')<{
  isOverviewOpen: boolean;
  isFormOpen: boolean;
}>`
  /**
   * We parameterise the min-width of the fronts container to handle the
   * presence of the form and overview content. When containers are at their
   * minimum widths and a form or overview is opened, we increase the min-width
   * of the front container proportionally to keep the collection container the
   * same width.
   */
  min-width: ${({ isOverviewOpen, isFormOpen, theme }) =>
    isFormOpen
      ? theme.front.minWidth + formMinWidth + 10
      : isOverviewOpen
      ? theme.front.minWidth + theme.front.overviewMinWidth + 10
      : theme.front.minWidth}px;
  flex: 1 1;
  height: 100%;
`;

const FrontContainer = styled('div')`
  height: 100%;
  transform: translate3d(0, 0, 0);
`;

const FrontSectionContent = styled(SectionContent)`
  padding-top: 0;
`;

const FrontHeaderButton = styled(Button)`
  color: #fff;
  padding: 0 5px;
  display: flex;
  align-items: center;

  &:not(:last-child) {
    margin-right: 10px;
  }
`;

const PreviewButtonText = styled('span')`
  padding: 0 5px;
  text-decoration: none;
`;
interface FrontsContainerProps {
  frontId: string;
}

type FrontsComponentProps = FrontsContainerProps & {
  selectedFront: FrontConfig;
  alsoOn: { [id: string]: AlsoOnDetail };
  isOverviewOpen: boolean;
  isFormOpen: boolean;
  frontsActions: {
    fetchLastPressed: (frontId: string) => void;
    editorCloseFront: (frontId: string) => void;
    updateCollection: (collection: Collection) => void;
    changeBrowsingStage: (frontId: string, browsingState: Stages) => void;
    updateFrontMetadata: (
      frontId: string,
      metadata: EditionsFrontMetadata
    ) => void;
  };
};

interface ComponentState {
  collectionSet: CollectionItemSets;
  frontNameValue: string;
  editingFrontName: boolean;
}

class Fronts extends React.Component<FrontsComponentProps, ComponentState> {
  public state = {
    collectionSet: frontStages.draft,
    frontNameValue: '',
    editingFrontName: false
  };

  public handleCollectionSetSelect(key: string) {
    const browsingStage = frontStages[key];
    this.setState({
      collectionSet: browsingStage
    });
    this.props.frontsActions.changeBrowsingStage(
      this.props.frontId,
      browsingStage
    );
  }

  public handleRemoveFront = () => {
    this.props.frontsActions.editorCloseFront(this.props.frontId);
  };

  renameFront = () => {
    this.setState({
      frontNameValue: this.getTitle() || '',
      editingFrontName: true
    });
  };

  getTitle = () => {
    const { selectedFront } = this.props;

    if (selectedFront) {
      if (selectedFront.metadata && selectedFront.metadata.nameOverride) {
        return selectedFront.metadata.nameOverride;
      } else {
        return startCase(
          this.props.selectedFront.displayName || this.props.selectedFront.id
        );
      }
    }

    return;
  };

  setName = () => {
    const metadata =
      this.state.frontNameValue !== ''
        ? {
            ...this.props.selectedFront.metadata,
            nameOverride: this.state.frontNameValue
          }
        : {
            ...this.props.selectedFront.metadata,
            nameOverride: undefined
          };

    this.props.frontsActions.updateFrontMetadata(
      this.props.selectedFront.id,
      metadata
    );

    this.setState({ editingFrontName: false });
  };

  public render() {
    const { frontId, isFormOpen, isOverviewOpen } = this.props;
    const title = this.getTitle();

    const { frontNameValue, editingFrontName } = this.state;
    const canRename = this.props.selectedFront
      ? this.props.selectedFront.canRename
      : false;

    return (
      <SingleFrontContainer
        key={frontId}
        id={createFrontId(frontId)}
        isFormOpen={isFormOpen}
        isOverviewOpen={isOverviewOpen}
      >
        <FrontContainer>
          <FrontHeader greyHeader={true}>
            {editingFrontName ? (
              <FrontsHeaderInput
                data-testid="rename-front-input"
                value={frontNameValue}
                autoFocus
                onChange={e =>
                  this.setState({ frontNameValue: e.target.value })
                }
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    this.setName();
                  }
                }}
                onBlur={this.setName}
              />
            ) : (
              <FrontsHeaderText title={title} data-testid="front-name">
                {title}
              </FrontsHeaderText>
            )}
            <FrontHeaderMeta>
              <EditModeVisibility visibleMode="fronts">
                <a
                  href={`https://preview.gutools.co.uk/responsive-viewer/https://preview.gutools.co.uk/${
                    this.props.frontId
                  }`}
                  target="preview"
                >
                  <FrontHeaderButton size="l">
                    <PreviewEyeIcon size="xl" />
                    <PreviewButtonText>Preview</PreviewButtonText>
                  </FrontHeaderButton>
                </a>
                <StageSelectButtons>
                  <RadioGroup>
                    {Object.keys(frontStages).map(key => (
                      <RadioButton
                        inline
                        key={key}
                        name={`${this.props.frontId} - frontStages`}
                        checked={frontStages[key] === this.state.collectionSet}
                        onChange={() => this.handleCollectionSetSelect(key)}
                        label={toTitleCase(frontStages[key])}
                      />
                    ))}
                  </RadioGroup>
                </StageSelectButtons>
              </EditModeVisibility>
              {canRename && (
                <FrontHeaderButton
                  data-testid="rename-front-button"
                  onClick={this.renameFront}
                  size="l"
                >
                  Rename
                </FrontHeaderButton>
              )}
              <FrontHeaderButton onClick={this.handleRemoveFront} size="l">
                <ClearIcon size="xl" />
              </FrontHeaderButton>
            </FrontHeaderMeta>
          </FrontHeader>
          <FrontSectionContent direction="column">
            {this.props.selectedFront && (
              <Front
                id={this.props.frontId}
                alsoOn={this.props.alsoOn}
                collectionIds={this.props.selectedFront.collections}
                browsingStage={this.state.collectionSet}
              />
            )}
          </FrontSectionContent>
        </FrontContainer>
      </SingleFrontContainer>
    );
  }
}

const createMapStateToProps = () => {
  const selectAlsoOnFronts = createSelectAlsoOnFronts();
  return (state: State, { frontId }: FrontsContainerProps) => ({
    selectedFront: selectFront(state, { frontId }),
    alsoOn: selectAlsoOnFronts(state, { frontId }),
    isOverviewOpen: selectIsFrontOverviewOpen(state, frontId),
    isFormOpen: !!selectSingleArticleFragmentForm(state, frontId)
  });
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  frontsActions: {
    fetchLastPressed: (id: string) => dispatch(fetchLastPressed(id)),
    updateCollection: (collection: Collection) =>
      dispatch(updateCollection(collection)),
    editorCloseFront: (id: string) => dispatch(editorCloseFront(id)),
    changeBrowsingStage: (id: string, browsingStage: Stages) =>
      dispatch(changedBrowsingStage(id, browsingStage)),
    updateFrontMetadata: (id: string, metadata: EditionsFrontMetadata) =>
      dispatch(updateFrontMetadata(id, metadata))
  }
});

export { Fronts as FrontsComponent };
export { FrontsComponentProps };

export default connect(
  createMapStateToProps,
  mapDispatchToProps
)(Fronts);
