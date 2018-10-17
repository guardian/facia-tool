import { Dispatch } from 'types/Store';
import React from 'react';
import { connect } from 'react-redux';
import CollectionDisplay from 'shared/components/Collection';
import AlsoOnNotification from 'components/AlsoOnNotification';
import Button from 'shared/components/input/ButtonDefault';
import * as Guration from 'lib/guration';
import { AlsoOnDetail } from 'types/Collection';
import { publishCollection } from 'actions/Fronts';
import { hasUnpublishedChangesSelector } from 'selectors/frontsSelectors';
import { State } from 'types/State';
import { Stages } from 'shared/types/Collection';

interface CollectionPropsBeforeState {
  id: string;
  groups: any;
  children: any;
  alsoOn: { [id: string]: AlsoOnDetail };
  frontId: string;
}

type CollectionProps = CollectionPropsBeforeState & {
  publishCollection: (collectionId: string, frontId: string) => Promise<void>;
  hasUnpublishedChanges: boolean;
  canPublish: boolean;
  browsingStage: Stages;
};

const Collection = ({
  id,
  groups,
  children,
  alsoOn,
  browsingStage,
  hasUnpublishedChanges,
  canPublish = true,
  publishCollection: publish,
  frontId
}: CollectionProps) => (
  <CollectionDisplay
    id={id}
    browsingStage={browsingStage}
    headlineContent={
      hasUnpublishedChanges &&
      canPublish && (
        <Button size="l" onClick={() => publish(id, frontId)}>
          Launch
        </Button>
      )
    }
    metaContent={
      alsoOn[id].fronts.length ? (
        <AlsoOnNotification alsoOn={alsoOn[id]} />
      ) : null
    }
  >
    <Guration.Level arr={groups} type="group" getKey={({ uuid: key }) => key}>
      {children}
    </Guration.Level>
  </CollectionDisplay>
);

const mapStateToProps = (state: State, props: CollectionPropsBeforeState) => ({
  hasUnpublishedChanges: hasUnpublishedChangesSelector(state, {
    collectionId: props.id
  })
});

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    publishCollection: (id: string, frontId: string) => dispatch(publishCollection(id, frontId))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Collection);
