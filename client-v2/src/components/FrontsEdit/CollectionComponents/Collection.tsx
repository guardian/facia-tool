import { Dispatch } from 'types/Store';
import React from 'react';
import { connect } from 'react-redux';
import CollectionDisplay from 'shared/components/Collection';
import CollectionNotification from 'components/CollectionNotification';
import Button from 'shared/components/input/ButtonDefault';
import { AlsoOnDetail } from 'types/Collection';
import {
  publishCollection,
  discardDraftChangesToCollection
} from 'actions/Collections';
import { hasUnpublishedChangesSelector } from 'selectors/frontsSelectors';
import { isCollectionLockedSelector } from 'selectors/collectionSelectors';
import { State } from 'types/State';
import { CollectionItemSets, Group } from 'shared/types/Collection';
import {
  createCollectionStageGroupsSelector,
  createCollectionEditWarningSelector,
  selectSharedState,
  createPreviouslyLiveArticlesInCollectionSelector
} from 'shared/selectors/shared';
import {
  selectIsCollectionOpen,
  editorOpenCollections,
  editorCloseCollections,
  selectHasMultipleFrontsOpen,
  selectEditorArticleFragment
} from 'bundles/frontsUIBundle';
import { getArticlesForCollections } from 'actions/Collections';
import { collectionItemSets } from 'constants/fronts';
import { createSelectIsArticleInCollection } from 'shared/selectors/collection';
import CollectionMetaContainer from 'shared/components/collection/CollectionMetaContainer';
import ButtonCircularCaret from 'shared/components/input/ButtonCircularCaret';
import { styled } from 'constants/theme';

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
};

const PreviouslyCollectionContainer = styled('div')`
  opacity: 0.5;
`;

const PreviouslyCollectionToggle = styled(CollectionMetaContainer)`
  font-size: 16px;
  font-weight: bold;
`;

const PreviouslyCollectionToggleCaret = styled(ButtonCircularCaret)`
  margin-top: 5px;
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
      discardDraftChangesToCollection: discardDraftChanges
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
          canPublish && (
            <React.Fragment>
              <Button
                size="l"
                priority="default"
                onClick={() => discardDraftChanges(id)}
                tabIndex={-1}
                disabled={isEditFormOpen}
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
                disabled={isEditFormOpen}
                title={
                  isEditFormOpen
                    ? 'You cannot launch this collection whilst the edit form is open.'
                    : undefined
                }
              >
                Launch
              </Button>
            </React.Fragment>
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
        {groups.map(group => children(group, isUneditable))}

        <PreviouslyCollectionContainer>
          <PreviouslyCollectionToggle onClick={this.togglePreviouslyOpen}>
            Previously
            <PreviouslyCollectionToggleCaret active={isPreviouslyOpen} />
          </PreviouslyCollectionToggle>
          {isPreviouslyOpen &&
            previousGroups.map(group => children(group, true, false))}
        </PreviouslyCollectionContainer>
      </CollectionDisplay>
    );
  }
}

const createMapStateToProps = () => {
  const collectionStageGroupsSelector = createCollectionStageGroupsSelector();
  const editWarningSelector = createCollectionEditWarningSelector();
  const previouslySelector = createPreviouslyLiveArticlesInCollectionSelector();
  return (
    state: State,
    { browsingStage, id, priority, frontId }: CollectionPropsBeforeState
  ) => {
    const selectIsArticleInCollection = createSelectIsArticleInCollection();
    const selectedArticleFragmentData = selectEditorArticleFragment(
      state,
      frontId
    );
    return {
      hasUnpublishedChanges: hasUnpublishedChangesSelector(state, {
        collectionId: id
      }),
      isCollectionLocked: isCollectionLockedSelector(state, id),
      groups: collectionStageGroupsSelector(selectSharedState(state), {
        collectionSet: browsingStage,
        collectionId: id
      }),
      previousGroups: previouslySelector(selectSharedState(state), {
        collectionId: id
      }),
      displayEditWarning: editWarningSelector(selectSharedState(state), {
        collectionId: id
      }),
      isOpen: selectIsCollectionOpen(state, id),
      hasMultipleFrontsOpen: selectHasMultipleFrontsOpen(state, priority),
      isEditFormOpen:
        !!selectedArticleFragmentData &&
        selectIsArticleInCollection(state.shared, {
          collectionId: id,
          collectionSet: browsingStage,
          articleFragmentId: selectedArticleFragmentData.id
        })
    };
  };
};

const mapDispatchToProps = (
  dispatch: Dispatch,
  { browsingStage }: CollectionPropsBeforeState
) => ({
  publishCollection: (id: string, frontId: string) =>
    dispatch(publishCollection(id, frontId)),
  discardDraftChangesToCollection: (id: string) =>
    dispatch(discardDraftChangesToCollection(id)),
  onChangeOpenState: (id: string, isOpen: boolean) => {
    if (isOpen) {
      dispatch(editorCloseCollections(id));
    } else {
      dispatch(getArticlesForCollections([id], browsingStage));
      dispatch(editorOpenCollections(id));
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
