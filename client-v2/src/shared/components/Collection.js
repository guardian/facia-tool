// @flow

import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import type { Collection } from '../types/Collection';
import type { State } from '../types/State';
import Article from './Article';
import GroupDisplay from './GroupDisplay';
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
  stage: string
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

const collectionDetail = ({ collection, stage }: Props) =>
  collection ? (
    <CollectionContainer>
      <CollectionHeadline>{collection.displayName}</CollectionHeadline>
      {collection.groups
        ? collection.groups
            .slice()
            .reverse()
            .map(group => (
              <GroupDisplay
                key={group}
                groupName={group}
                collectionId={collection.id}
                stage={stage}
              />
            ))
        : collection.articles[stage] &&
          collection.articles[stage].map(id => <Article key={id} id={id} />)}
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
