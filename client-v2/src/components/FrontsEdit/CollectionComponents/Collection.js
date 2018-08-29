// @flow

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import CollectionDisplay from 'shared/components/Collection';
import AlsoOnNotification from 'components/AlsoOnNotification';
import Button from 'shared/components/input/ButtonDefault';
import * as Guration from '@guardian/guration';
import type { AlsoOnDetail } from 'types/Collection';
import { publishCollection } from 'actions/Fronts';
import { hasUnpublishedChangesSelector } from 'selectors/frontsSelectors';
import { type State } from 'types/State';

type CollectionPropsBeforeState = {
  id: string,
  groups: *,
  children: *,
  alsoOn: { [string]: AlsoOnDetail }
};
type CollectionProps = CollectionPropsBeforeState & {
  publishCollection: (collectionId: string) => Promise<void>,
  hasUnpublishedChanges: boolean,
  canPublish: boolean,
  browsingStage?: string
};

const Collection = ({
  id,
  groups,
  children,
  alsoOn,
  browsingStage,
  hasUnpublishedChanges,
  canPublish = true,
  publishCollection: publish
}: CollectionProps) => (
  <CollectionDisplay
    id={id}
    browsingStage={browsingStage}
    headlineContent={
      hasUnpublishedChanges &&
      canPublish && (
        <Button dark onClick={() => publish(id)}>
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

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators({ publishCollection }, dispatch);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Collection);
