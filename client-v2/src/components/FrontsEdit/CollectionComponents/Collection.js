// @flow

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import CollectionDisplay from 'shared/components/Collection';
import AlsoOnNotification from 'components/AlsoOnNotification';
import Button from 'components/Button';
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
  hasUnpublishedChanges: boolean
};

const getArticleFragmentLengths = <T: { articleFragments: Array<*> }>(
  acc: Array<[T, number]> | [],
  group: T,
  i: number
): Array<[T, number]> => {
  const [{ articleFragments }, offset] = acc[i - 1] || [
    { articleFragments: [] },
    0
  ];
  return [...acc, [group, articleFragments.length + offset]];
};

const Collection = ({
  id,
  groups,
  children,
  alsoOn,
  hasUnpublishedChanges,
  publishCollection: publish
}: CollectionProps) => (
  <CollectionDisplay id={id}>
    {hasUnpublishedChanges && (
      <Button dark onClick={() => publish(id)}>
        Launch
      </Button>
    )}
    <AlsoOnNotification alsoOn={alsoOn[id]} />
    <div style={{ marginLeft: 10 }}>
      {groups
        .reduce(getArticleFragmentLengths, [])
        .map(([group, offset]) => (
          <React.Fragment key={group.id}>
            {children(group, offset)}
          </React.Fragment>
        ))}
    </div>
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
