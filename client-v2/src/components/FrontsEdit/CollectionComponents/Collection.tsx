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
import {
  selectHasUnpublishedChanges,
  selectCollectionHasPrefill
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
import { styled } from 'constants/theme';
import EditModeVisibility from 'components/util/EditModeVisibility';
import { getPrefills } from 'services/editionsApi';
import { fetchPrefill } from 'bundles/capiFeedBundle';

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
  previousGroups: Group[];
  displayEditWarning: boolean;
  isCollectionLocked: boolean;
  isEditFormOpen: boolean;
  isOpen: boolean;
  hasMultipleFrontsOpen: boolean;
  onChangeOpenState: (id: string, isOpen: boolean) => void;
  fetchPreviousCollectionArticles: (id: string) => void;
  fetchPrefill: (id: string) => void;
  hasPrefill: boolean;
};

const PreviouslyCollectionContainer = styled('div')`
  opacity: 0.5;
`;

const PreviouslyCollectionToggle = styled(CollectionMetaContainer)`
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  padding-top: 0.25em;
`;

const PreviouslyGroupsWrapper = styled.div`
  padding-top: 0.25em;
`;

class Collection extends React.Component<CollectionProps> {
  public state = {
    isPreviouslyOpen: false
  };

  public togglePreviouslyOpen = () => {
    const { isPreviouslyOpen } = this.state;
    if (!isPreviouslyOpen) {
      this.props.fetchPreviousCollectionArticles(this.props.id);
    }
    this.setState({ isPreviouslyOpen: !isPreviouslyOpen });
  };

  public render() {
    const {
      id,
      frontId,
      children,
      alsoOn,
      groups,
      previousGroups,
      browsingStage,
      hasUnpublishedChanges,
      canPublish = true,
      publishCollection: publish,
      displayEditWarning,
      isCollectionLocked,
      isOpen,
      onChangeOpenState,
      hasMultipleFrontsOpen,
      isEditFormOpen,
      discardDraftChangesToCollection: discardDraftChanges,
      hasPrefill,
      fetchPrefill
    } = this.props;

    const { isPreviouslyOpen } = this.state;

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
          canPublish &&
          !isEditFormOpen && (
            <Fragment>
              {hasPrefill && (
                <EditModeVisibility visibleMode="editions">
                  <Button
                    size="l"
                    priority="default"
                    onClick={() => fetchPrefill(id)}
                    title="Get suggested articles for this collection"
                  >
                    Suggest Articles
                  </Button>
                </EditModeVisibility>
              )}
              <EditModeVisibility visibleMode="fronts">
                <Button
                  size="l"
                  priority="default"
                  onClick={() => discardDraftChanges(id)}
                  tabIndex={-1}
                  data-testid="collection-discard-button"
                  title={
                    isEditFormOpen
                      ? 'You cannot discard changes to this collection whilst the edit form is open.'
                      : undefined
                  }
                >
                  Discard
                </Button>
                <Button
                  size="l"
                  priority="primary"
                  onClick={() => publish(id, frontId)}
                  tabIndex={-1}
                  title={
                    isEditFormOpen
                      ? 'You cannot launch this collection whilst the edit form is open.'
                      : undefined
                  }
                >
                  Launch
                </Button>
              </EditModeVisibility>
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

        <EditModeVisibility visibleMode="fronts">
          <PreviouslyCollectionContainer data-testid="previously">
            <PreviouslyCollectionToggle
              onClick={this.togglePreviouslyOpen}
              data-testid="previously-toggle"
            >
              Recently removed
              <ButtonCircularCaret active={isPreviouslyOpen} />
            </PreviouslyCollectionToggle>
            {isPreviouslyOpen && (
              <PreviouslyGroupsWrapper>
                {previousGroups.map(group => children(group, true, false))}
              </PreviouslyGroupsWrapper>
            )}
          </PreviouslyCollectionContainer>
        </EditModeVisibility>
      </CollectionDisplay>
    );
  }
}

const createMapStateToProps = () => {
  const selectCollectionStageGroups = createSelectCollectionStageGroups();
  const selectEditWarning = createSelectCollectionEditWarning();
  const selectPreviously = createSelectPreviouslyLiveArticlesInCollection();
  return (
    state: State,
    {
      browsingStage,
      id: collectionId,
      priority,
      frontId
    }: CollectionPropsBeforeState
  ) => {
    const selectDoesCollectionHaveOpenForms = createSelectDoesCollectionHaveOpenForms();
    return {
      hasPrefill: selectCollectionHasPrefill(state, collectionId),
      hasUnpublishedChanges: selectHasUnpublishedChanges(state, {
        collectionId
      }),
      isCollectionLocked: selectIsCollectionLocked(state, collectionId),
      groups: selectCollectionStageGroups(selectSharedState(state), {
        collectionSet: browsingStage,
        collectionId
      }),
      previousGroups: selectPreviously(selectSharedState(state), {
        collectionId
      }),
      displayEditWarning: selectEditWarning(selectSharedState(state), {
        collectionId
      }),
      isOpen: selectIsCollectionOpen(state, collectionId),
      hasMultipleFrontsOpen: selectHasMultipleFrontsOpen(state, priority),
      isEditFormOpen: selectDoesCollectionHaveOpenForms(state, collectionId)
    };
  };
};

const mapDispatchToProps = (
  dispatch: Dispatch,
  { browsingStage }: CollectionPropsBeforeState
) => ({
  fetchPrefill: (id: string) => dispatch(fetchPrefill(id)),
  publishCollection: (id: string, frontId: string) =>
    dispatch(publishCollection(id, frontId)),
  discardDraftChangesToCollection: (id: string) =>
    dispatch(discardDraftChangesToCollection(id)),
  onChangeOpenState: (id: string, isOpen: boolean) => {
    if (isOpen) {
      dispatch(editorCloseCollections(id));
    } else {
      dispatch(openCollectionsAndFetchTheirArticles([id], browsingStage));
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
