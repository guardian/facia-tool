import { Dispatch } from 'types/Store';
import React from 'react';
import { connect } from 'react-redux';
import CollectionDisplay from 'shared/components/Collection';
import CollectionNotification from 'components/CollectionNotification';
import Button from 'shared/components/input/ButtonDefault';
import { AlsoOnDetail } from 'types/Collection';
import { publishCollection } from 'actions/Fronts';
import {
  hasUnpublishedChangesSelector,
  isCollectionUneditableSelector
} from 'selectors/frontsSelectors';
import { State } from 'types/State';
import { CollectionItemSets, Group } from 'shared/types/Collection';
import {
  createCollectionStageGroupsSelector,
  createCollectionEditWarningSelector,
  selectSharedState
} from 'shared/selectors/shared';

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
};

const Collection = ({
  id,
  children,
  alsoOn,
  groups,
  browsingStage,
  hasUnpublishedChanges,
  canPublish = true,
  publishCollection: publish,
  frontId,
  displayEditWarning,
  isUneditable
}: CollectionProps) => (
  <CollectionDisplay
    id={id}
    browsingStage={browsingStage}
    isUneditable={isUneditable}
    headlineContent={
      hasUnpublishedChanges &&
      canPublish && (
        <Button size="l" onClick={() => publish(id, frontId)}>
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
    })
  });
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    publishCollection: (id: string, frontId: string) =>
      dispatch(publishCollection(id, frontId))
  };
};

export default connect(
  createMapStateToProps,
  mapDispatchToProps
)(Collection);
