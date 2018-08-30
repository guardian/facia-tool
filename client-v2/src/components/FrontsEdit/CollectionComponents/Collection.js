// @flow

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import CollectionDisplay from 'shared/components/Collection';
import AlsoOnNotification from 'components/AlsoOnNotification';
import Button from 'components/Button';
import * as Guration from '@guardian/guration';
import type { AlsoOnDetail } from 'types/Collection';
import { publishCollection } from 'actions/Fronts';
import { hasUnpublishedChangesSelector } from 'selectors/frontsSelectors';
import { type State } from 'types/State';

type CollectionPropsBeforeState = {
  id: string,
  groups: *,
  children: *,
  alsoOn: { [string]: AlsoOnDetail },
  frontId: string
};

type CollectionProps = CollectionPropsBeforeState & {
  publishCollection: (collectionId: string, frontId: string) => Promise<void>,
  hasUnpublishedChanges: boolean
};

const Collection = ({
  id,
  groups,
  children,
  alsoOn,
  hasUnpublishedChanges,
  publishCollection: publish,
  frontId
}: CollectionProps) => (
  <CollectionDisplay
    id={id}
    headlineContent={
      hasUnpublishedChanges && (
        <Button dark onClick={() => publish(id, frontId)}>
          Launch
        </Button>
      )
    }
  >
    <AlsoOnNotification alsoOn={alsoOn[id]} />
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
