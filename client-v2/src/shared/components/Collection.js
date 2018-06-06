// @flow

import React, { type Node as ReactNode } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import type { Collection } from '../types/Collection';
import type { State } from '../types/State';
import {
  createCollectionSelector,
  selectSharedState
} from '../selectors/shared';

type ContainerProps = {
  id: string, // eslint-disable-line react/no-unused-prop-types
  selectSharedState: (state: any) => State // eslint-disable-line react/no-unused-prop-types
};

type Props = ContainerProps & {
  collection: Collection,
  children: ReactNode
};

const CollectionContainer = styled('div')`
  background-color: white;
  padding: 5px;
  margin: 5px;
  color: black;
`;

const CollectionHeadline = styled('div')`
  font-weight: bold;
  padding: 7px;
`;

const collectionDetail = ({ collection, children }: Props) =>
  collection ? (
    <CollectionContainer>
      <CollectionHeadline>{collection.displayName}</CollectionHeadline>
      {children}
    </CollectionContainer>
  ) : (
    <span>Waiting for collection</span>
  );

const createMapStateToProps = () => {
  const collectionSelector = createCollectionSelector();
  // $FlowFixMe
  return (state: State, props: ContainerProps): { collection: Collection } => ({
    collection: collectionSelector(
      props.selectSharedState
        ? props.selectSharedState(state)
        : selectSharedState(state),
      { collectionId: props.id }
    )
  });
};

export default connect(createMapStateToProps)(collectionDetail);
