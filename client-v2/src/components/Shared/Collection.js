// @flow

import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import { createCollectionSelector } from 'selectors/shared';
import type { Collection } from 'types/Shared';
import type { State } from 'types/State';
import Article from './Article';
import GroupDisplay from './GroupDisplay';

type ContainerProps = {
  id: string // eslint-disable-line react/no-unused-prop-types
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

const collectionDetail = ({ collection, stage }: Props) => {
  const mapToGroup = (group, index) => (
    <GroupDisplay
      key={group}
      groupName={group}
      collectionId={collection.id}
      groupDisplayIndex={index}
      stage={stage}
    />
  );
  return collection ? (
    <CollectionContainer>
      <CollectionHeadline>{collection.displayName}</CollectionHeadline>
      {collection.groups
        ? collection.groups
            .slice()
            .reverse()
            .map(mapToGroup)
        : collection.articles[stage] &&
          collection.articles[stage].map(id => <Article key={id} id={id} />)}
    </CollectionContainer>
  ) : (
    <span>Waiting for collection</span>
  );
};

const createMapStateToProps = () => {
  const collectionSelector = createCollectionSelector();
  return (state: State, props: ContainerProps) => ({
    collection: collectionSelector(state, { collectionId: props.id })
  });
};

export default connect(createMapStateToProps)(collectionDetail);
