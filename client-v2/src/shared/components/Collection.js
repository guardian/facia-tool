// @flow

import React, { type Node as ReactNode } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import type { Collection } from '../types/Collection';
import type { State } from '../types/State';
import Article from './Article';
import GroupDisplay from './GroupDisplay';
import { selectSharedState } from '../selectors/shared';
import { selectors as collectionSelectors } from '../bundles/collectionsBundle';

type ContainerProps = {
  id: string, // eslint-disable-line react/no-unused-prop-types
  selectSharedState?: (state: any) => State // eslint-disable-line react/no-unused-prop-types
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

const mapStateToProps = (
  state: State,
  props: ContainerProps
): { collection: Collection } => ({
  collection: collectionSelectors.selectById(
    props.selectSharedState
      ? props.selectSharedState(state)
      : selectSharedState(state),
    props.id
  )
});

export default connect(mapStateToProps)(collectionDetail);
