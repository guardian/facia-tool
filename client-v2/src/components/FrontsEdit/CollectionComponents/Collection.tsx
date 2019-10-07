import { Dispatch } from 'types/Store';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import CollectionDisplay from 'shared/components/Collection';
import CollectionNotification from 'components/CollectionNotification';
import Button from 'shared/components/input/ButtonDefault';
import { AlsoOnDetail } from 'types/Collection';
import {
  publishCollection,
  discardDraftChangesToCollection,
  openCollectionsAndFetchTheirArticles
} from 'actions/Collections';
import { actions, selectors } from 'shared/bundles/collectionsBundle';
import {
  selectHasUnpublishedChanges,
  selectCollectionHasPrefill,
  selectCollectionIsHidden
} from 'selectors/frontsSelectors';
import { selectIsCollectionLocked } from 'selectors/collectionSelectors';
import { State } from 'types/State';
import { CollectionItemSets, Group } from 'shared/types/Collection';
import {
  createSelectCollectionStageGroups,
  createSelectCollectionEditWarning,
  selectSharedState,
  createSelectPreviouslyLiveArticlesInCollection
} from 'shared/selectors/shared';
import {
  selectIsCollectionOpen,
  editorCloseCollections,
  selectHasMultipleFrontsOpen,
  createSelectDoesCollectionHaveOpenForms
} from 'bundles/frontsUIBundle';
import { getArticlesForCollections } from 'actions/Collections';
import { collectionItemSets } from 'constants/fronts';
import CollectionMetaContainer from 'shared/components/collection/CollectionMetaContainer';
import ButtonCircularCaret from 'shared/components/input/ButtonCircularCaret';
import { theme, styled } from 'constants/theme';
import EditModeVisibility from 'components/util/EditModeVisibility';
import { fetchPrefill } from 'bundles/capiFeedBundle';
import LoadingGif from 'images/icons/loading.gif';
import OpenFormsWarning from './OpenFormsWarning';

interface CollectionPropsBeforeState {
  id: string;
  children: (
    group: Group,
    isUneditable: boolean,
    showGroupName?: boolean
  ) => React.ReactNode;
  alsoOn: { [id: string]: AlsoOnDetail };
  frontId: string;
  browsingStage: CollectionItemSets;
  priority: string;
}

type CollectionProps = CollectionPropsBeforeState & {
  publishCollection: (collectionId: string, frontId: string) => Promise<void>;
  discardDraftChangesToCollection: (
    collectionId: string
  ) => Promise<void | string[]>;
  hasUnpublishedChanges: boolean;
  canPublish: boolean;
  groups: Group[];
  previousGroup: Group;
  displayEditWarning: boolean;
  isCollectionLocked: boolean;
  isOpen: boolean;
  hasOpenForms: boolean;
  hasContent: boolean;
  hasMultipleFrontsOpen: boolean;
  onChangeOpenState: (id: string, isOpen: boolean) => void;
  fetchPreviousCollectionArticles: (id: string) => void;
  fetchPrefill: (id: string) => void;
  hasPrefill: boolean;
  setHidden: (id: string, isHidden: boolean) => void;
  isHidden: boolean;
};

interface CollectionState {
  showOpenFormsWarning: boolean;
  isPreviouslyOpen: boolean;
  isLaunching: boolean;
}

const PreviouslyCollectionContainer = styled.div``;

const PreviouslyCollectionToggle = styled(CollectionMetaContainer)`
  align-items: center;
  font-size: 14px;
  font-weight: normal;
  padding-top: 0.25em;
  justify-content: unset;
  border-top: 1px solid ${theme.shared.colors.greyMediumLight};
`;

const PreviouslyGroupsWrapper = styled.div`
  padding-top: 0.25em;
  opacity: 0.5;
`;

const PreviouslyCollectionInfo = styled.div`
  background: ${theme.shared.colors.greyVeryLight};
  color: ${theme.shared.colors.blackDark};
  padding: 4px 6px;
  font-size: 14px;
`;

const LoadingImageBox = styled.div`
  min-width: 50px;
`;

const PreviouslyCircularCaret = styled(ButtonCircularCaret)`
  height: 15px;
  width: 15px;
  background-color: ${theme.shared.colors.greyMediumLight};
  margin-left: 6px;
  svg {
    height: 15px;
    width: 15px;
  }
`;

const OpenFormsWarningContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  border: 1px solid ${theme.shared.base.colors.brandColor};
  background-color: ${theme.shared.base.colors.brandColorLight};
  padding: 10px;
  font-family: TS3TextSans;
  font-weight: normal;
  font-size: 12px;
  line-height: 14px;
`;

const ActionButtonsContainer = styled.div`
  display: flex;
`;

class Collection extends React.Component<CollectionProps, CollectionState> {
  public state = {
    isPreviouslyOpen: false,
    isLaunching: false,
    showOpenFormsWarning: false
  };

  // added to prevent setState call on unmounted component
  public isComponentMounted = false;

  public componentDidMount() {
    this.isComponentMounted = true;
  }

  public componentWillUnmount() {
    this.isComponentMounted = false;
  }

  public togglePreviouslyOpen = () => {
    const { isPreviouslyOpen } = this.state;
    if (!isPreviouslyOpen) {
      this.props.fetchPreviousCollectionArticles(this.props.id);
    }
    this.setState({ isPreviouslyOpen: !isPreviouslyOpen });
  };

  public startPublish = (id: string, frontId: string) => {
    this.setState({ isLaunching: true });
    this.props.publishCollection(id, frontId).then(res => {
      if (this.isComponentMounted) {
        this.setState({ isLaunching: false });
      }
    });
  };

  public render() {
    const {
      id,
      frontId,
      children,
      alsoOn,
      groups,
      previousGroup: previousGroup,
      browsingStage,
      hasUnpublishedChanges,
      canPublish = true,
      displayEditWarning,
      isCollectionLocked,
      isOpen,
      onChangeOpenState,
      hasMultipleFrontsOpen,
      discardDraftChangesToCollection: discardDraftChanges,
      hasPrefill,
      isHidden,
      hasContent,
      hasOpenForms
    } = this.props;

    const { isPreviouslyOpen, isLaunching } = this.state;

    const isUneditable =
      isCollectionLocked || browsingStage !== collectionItemSets.draft;

    return (
      <CollectionDisplay
        frontId={frontId}
        id={id}
        browsingStage={browsingStage}
        isUneditable={isUneditable}
        isLocked={isCollectionLocked}
        isOpen={isOpen}
        hasMultipleFrontsOpen={hasMultipleFrontsOpen}
        onChangeOpenState={() => onChangeOpenState(id, isOpen)}
        headlineContent={
          hasUnpublishedChanges &&
          canPublish && (
            <Fragment>
              <EditModeVisibility visibleMode="editions">
                <Button
                  size="l"
                  priority="default"
                  onClick={() => this.props.setHidden(id, !isHidden)}
                  title="Toggle the visibility of this container in this issue."
                >
                  {isHidden ? 'Unhide Container' : 'Hide Container'}
                </Button>
                {hasPrefill && (
                  <Button
                    data-testid="prefill-button"
                    size="l"
                    priority="default"
                    onClick={() => this.props.fetchPrefill(id)}
                    title="Get suggested articles for this collection"
                  >
                    Suggest Articles
                  </Button>
                )}
              </EditModeVisibility>
              <ActionButtonsContainer
                onMouseEnter={this.showOpenFormsWarning}
                onMouseLeave={this.hideOpenFormsWarning}
              >
                {hasOpenForms && this.state.showOpenFormsWarning && (
                  <OpenFormsWarningContainer>
                    <OpenFormsWarning collectionId={id} frontId={frontId} />
                  </OpenFormsWarningContainer>
                )}
                <EditModeVisibility visibleMode="fronts">
                  <Button
                    size="l"
                    priority="default"
                    onClick={() => discardDraftChanges(id)}
                    tabIndex={-1}
                    data-testid="collection-discard-button"
                  >
                    Discard
                  </Button>
                  <Button
                    size="l"
                    priority="primary"
                    onClick={() => this.startPublish(id, frontId)}
                    tabIndex={-1}
                    disabled={isLaunching}
                  >
                    {isLaunching ? (
                      <LoadingImageBox>
                        <img src={LoadingGif} />
                      </LoadingImageBox>
                    ) : (
                      'Launch'
                    )}
                  </Button>
                </EditModeVisibility>
              </ActionButtonsContainer>
            </Fragment>
          )
        }
        metaContent={
          alsoOn[id].fronts.length || displayEditWarning ? (
            <CollectionNotification
              displayEditWarning={displayEditWarning}
              alsoOn={alsoOn[id]}
            />
          ) : null
        }
      >
        {groups.map(group => children(group, isUneditable, true))}
        {hasContent && (
          <EditModeVisibility visibleMode="fronts">
            <PreviouslyCollectionContainer data-testid="previously">
              <PreviouslyCollectionToggle
                onClick={this.togglePreviouslyOpen}
                data-testid="previously-toggle"
              >
                Recently removed from launched front
                <PreviouslyCircularCaret active={isPreviouslyOpen} />
              </PreviouslyCollectionToggle>
              {isPreviouslyOpen && (
                <>
                  <PreviouslyCollectionInfo>
                    This contains the 5 most recently deleted articles from the
                    live front. If the deleted articles were never launched they
                    will not appear here.
                  </PreviouslyCollectionInfo>
                  <PreviouslyGroupsWrapper>
                    {children(previousGroup, true, false)}
                  </PreviouslyGroupsWrapper>
                </>
              )}
            </PreviouslyCollectionContainer>
          </EditModeVisibility>
        )}
      </CollectionDisplay>
    );
  }

  private showOpenFormsWarning = () =>
    this.setState({ showOpenFormsWarning: true });
  private hideOpenFormsWarning = () =>
    this.setState({ showOpenFormsWarning: false });
}

const createMapStateToProps = () => {
  const selectCollectionStageGroups = createSelectCollectionStageGroups();
  const selectEditWarning = createSelectCollectionEditWarning();
  const selectPreviously = createSelectPreviouslyLiveArticlesInCollection();
  const selectHasOpenForms = createSelectDoesCollectionHaveOpenForms();
  return (
    state: State,
    {
      browsingStage,
      id: collectionId,
      priority,
      frontId
    }: CollectionPropsBeforeState
  ) => ({
    isHidden: selectCollectionIsHidden(state, collectionId),
    hasPrefill: selectCollectionHasPrefill(state, collectionId),
    hasUnpublishedChanges: selectHasUnpublishedChanges(state, {
      collectionId
    }),
    isCollectionLocked: selectIsCollectionLocked(state, collectionId),
    groups: selectCollectionStageGroups(selectSharedState(state), {
      collectionSet: browsingStage,
      collectionId
    }),
    previousGroup: selectPreviously(selectSharedState(state), {
      collectionId
    }),
    displayEditWarning: selectEditWarning(selectSharedState(state), {
      collectionId
    }),
    isOpen: selectIsCollectionOpen(state, collectionId),
    hasMultipleFrontsOpen: selectHasMultipleFrontsOpen(state, priority),
    hasContent: !!selectors.selectById(selectSharedState(state), collectionId),
    hasOpenForms: selectHasOpenForms(state, { collectionId, frontId })
  });
};

const mapDispatchToProps = (
  dispatch: Dispatch,
  { browsingStage, frontId }: CollectionPropsBeforeState
) => ({
  fetchPrefill: (id: string) => dispatch(fetchPrefill(id)),
  setHidden: (id: string, isHidden: boolean) =>
    dispatch(actions.setHiddenAndPersist(id, isHidden)),
  publishCollection: (id: string) => dispatch(publishCollection(id, frontId)),
  discardDraftChangesToCollection: (id: string) =>
    dispatch(discardDraftChangesToCollection(id)),
  onChangeOpenState: (id: string, isOpen: boolean) => {
    if (isOpen) {
      dispatch(editorCloseCollections(id));
    } else {
      dispatch(
        openCollectionsAndFetchTheirArticles([id], frontId, browsingStage)
      );
    }
  },
  fetchPreviousCollectionArticles: (id: string) => {
    dispatch(getArticlesForCollections([id], collectionItemSets.previously));
  }
});

export default connect(
  createMapStateToProps,
  mapDispatchToProps
)(Collection);
