// @flow

import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import CollectionArticles from './CollectionArticles';
import GroupDisplay from './GroupDisplay';
import { createCollectionSelector } from 'selectors/shared';
import type { Collection } from '../../types/Shared';
import type { State } from '../../types/State';

type ContainerProps = {
  id: string
};

type Props = ContainerProps & {
  collection: Collection
};

type ComponentState = { stage: string };

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

class CollectionDetail extends React.Component<Props, ComponentState> {
  state = {
    stage: 'live'
  };

  render() {
    return (
      <CollectionContainer>
        <CollectionHeadline>
          {this.props.collection.displayName}
        </CollectionHeadline>
        {this.props.collection.groups ? (
          <GroupDisplay
            articles={this.props.collection[this.state.stage]}
            groups={this.props.collection.groups}
          />
        ) : (
          <CollectionArticles
            articles={this.props.collection.collectionArticles}
          />
        )}
      </CollectionContainer>
    );
  }
}

const createMapStateToProps = () => {
  const collectionSelector = createCollectionSelector();
  return (state: State, props: ContainerProps) => ({
    collection: collectionSelector(state, { collectionId: props.id })
  });
};

export default connect(createMapStateToProps)(CollectionDetail);
