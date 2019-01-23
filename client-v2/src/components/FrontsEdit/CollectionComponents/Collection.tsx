import { Dispatch } from 'types/Store';
import React from 'react';
import { connect } from 'react-redux';
import CollectionDisplay from 'shared/components/Collection';
import CollectionNotification from 'components/CollectionNotification';
import Button from 'shared/components/input/ButtonDefault';
import { AlsoOnDetail } from 'types/Collection';
import { publishCollection } from 'actions/Fronts';
import { hasUnpublishedChangesSelector } from 'selectors/frontsSelectors';
import { isCollectionUneditableSelector } from 'selectors/collectionSelectors';
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
  editorCloseCollections
} from 'bundles/frontsUIBundle';
import { getArticlesForCollections } from 'actions/Collections';

interface CollectionPropsBeforeState {
  id: string;
  children: (group: Group, isUneditable: boolean) => React.ReactNode;
  alsoOn: { [id: string]: AlsoOnDetail };
  frontId: string;
  browsingStage: CollectionItemSets;
}

type CollectionProps = CollectionPropsBeforeState & {
  publishCollection: (collectionId: string, frontId: string) => Promise<void>;
  hasUnpublishedChanges: boolean;
  canPublish: boolean;
  groups: Group[];
  displayEditWarning: boolean;
  isUneditable: boolean;
  isOpen: boolean;
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
  isUneditable,
  isOpen,
  onChangeOpenState
}: CollectionProps) => (
  <CollectionDisplay
    frontId={frontId}
    id={id}
    browsingStage={browsingStage}
    isUneditable={isUneditable}
    isOpen={isOpen}
    onChangeOpenState={() => onChangeOpenState(id, isOpen)}
    headlineContent={
      hasUnpublishedChanges &&
      canPublish && (
        <Button
          size="l"
          priority="primary"
          onClick={() => publish(id, frontId)}
        >
          Launch
        </Button>
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

const createMapStateToProps = () => {
  const collectionStageGroupsSelector = createCollectionStageGroupsSelector();
  const editWarningSelector = createCollectionEditWarningSelector();
  return (state: State, { browsingStage, id }: CollectionPropsBeforeState) => ({
    hasUnpublishedChanges: hasUnpublishedChangesSelector(state, {
      collectionId: id
    }),
    isUneditable: isCollectionUneditableSelector(state, id),
    groups: collectionStageGroupsSelector(selectSharedState(state), {
      collectionSet: browsingStage,
      collectionId: id
    }),
    displayEditWarning: editWarningSelector(selectSharedState(state), {
      collectionId: id
    }),
    isOpen: selectIsCollectionOpen(state, id)
  });
};

const mapDispatchToProps = (
  dispatch: Dispatch,
  { browsingStage }: CollectionPropsBeforeState
) => ({
  publishCollection: (id: string, frontId: string) =>
    dispatch(publishCollection(id, frontId)),
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
