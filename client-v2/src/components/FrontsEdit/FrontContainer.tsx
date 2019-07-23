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
  selectEditorArticleFragment
} from 'bundles/frontsUIBundle';
import Button from 'shared/components/input/ButtonDefault';
import { frontStages } from 'constants/fronts';
import { FrontConfig } from 'types/FaciaApi';
import { State } from 'types/State';
import { AlsoOnDetail } from 'types/Collection';
import {
  selectFront,
  createSelectAlsoOnFronts
} from 'selectors/frontsSelectors';
import Front from './Front';
import SectionHeader from '../layout/SectionHeader';
import SectionContent from '../layout/SectionContent';
import { CollectionItemSets, Collection } from 'shared/types/Collection';
import { toTitleCase } from 'util/stringUtils';
import { RadioButton, RadioGroup } from 'components/inputs/RadioButtons';
import { PreviewEyeIcon, ClearIcon } from 'shared/components/icons/Icons';
import { createFrontId } from 'util/editUtils';
import { formMinWidth } from './ArticleFragmentForm';
import { overviewMinWidth } from './FrontCollectionsOverview';
import EditModeVisibility from 'components/util/EditModeVisibility';

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

const StageSelectButtons = styled('div')`
  color: ${({ theme }) => theme.shared.colors.blackDark};
  padding: 0px 15px;
`;

const singleFrontMinWidth = 380;

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
  min-width: ${({ isOverviewOpen, isFormOpen }) =>
    isFormOpen
      ? singleFrontMinWidth + formMinWidth + 10
      : isOverviewOpen
      ? singleFrontMinWidth + overviewMinWidth + 10
      : singleFrontMinWidth}px;
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
    const { frontId, isFormOpen, isOverviewOpen } = this.props;
    const title =
      this.props.selectedFront &&
      startCase(
        this.props.selectedFront.displayName || this.props.selectedFront.id
      );
    return (
      <SingleFrontContainer
        key={frontId}
        id={createFrontId(frontId)}
        isFormOpen={isFormOpen}
        isOverviewOpen={isOverviewOpen}
      >
        <FrontContainer>
          <FrontHeader greyHeader={true}>
            <FrontsHeaderText title={title}>{title}</FrontsHeaderText>
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
  return (state: State, props: FrontsContainerProps) => ({
    selectedFront: selectFront(state, { frontId: props.frontId }),
    alsoOn: selectAlsoOnFronts(state, { frontId: props.frontId }),
    isOverviewOpen: selectIsFrontOverviewOpen(state, props.frontId),
    isFormOpen: !!selectEditorArticleFragment(state, props.frontId)
  });
};

const mapDispatchToProps = (
  dispatch: Dispatch,
  props: FrontsContainerProps
) => ({
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
