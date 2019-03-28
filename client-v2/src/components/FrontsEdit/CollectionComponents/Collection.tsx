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
  selectSharedState
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

interface CollectionPropsBeforeState {
  id: string;
  children: (group: Group, isUneditable: boolean) => React.ReactNode;
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
  displayEditWarning: boolean;
  isCollectionLocked: boolean;
  isEditFormOpen: boolean;
  isOpen: boolean;
  hasMultipleFrontsOpen: boolean;
  onChangeOpenState: (id: string, isOpen: boolean) => void;
};

const Collection = ({
  id,
  frontId,
  children,
  alsoOn,
  groups,
  browsingStage,
  hasUnpublishedChanges,
  canPublish = true,
  publishCollection: publish,
  displayEditWarning,
  isCollectionLocked,
  isOpen,
  isEditFormOpen,
  onChangeOpenState,
  hasMultipleFrontsOpen,
  discardDraftChangesToCollection: discardDraftChanges
}: CollectionProps) => {
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
              disabled={isEditFormOpen}
            >
              Discard
            </Button>
            <Button
              size="l"
              priority="primary"
              onClick={() => publish(id, frontId)}
              disabled={isEditFormOpen}
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
    </CollectionDisplay>
  );
};

const createMapStateToProps = () => {
  const collectionStageGroupsSelector = createCollectionStageGroupsSelector();
  const editWarningSelector = createCollectionEditWarningSelector();
  const selectIsArticleInCollection = createSelectIsArticleInCollection();
  return (
    state: State,
    { browsingStage, id, priority, frontId }: CollectionPropsBeforeState
  ) => {
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
      displayEditWarning: editWarningSelector(selectSharedState(state), {
        collectionId: id
      }),
      isOpen: selectIsCollectionOpen(state, id),
      isEditFormOpen:
        !!selectedArticleFragmentData &&
        selectIsArticleInCollection(state.shared, {
          collectionId: id,
          collectionSet: browsingStage,
          articleFragmentId: selectedArticleFragmentData.id
        }),
      hasMultipleFrontsOpen: selectHasMultipleFrontsOpen(state, priority)
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
  }
});

export default connect(
  createMapStateToProps,
  mapDispatchToProps
)(Collection);
