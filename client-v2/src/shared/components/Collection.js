// @flow

import React, { type Node as ReactNode } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import HorizontalRule from 'components/layout/HorizontalRule';
import ContainerHeading from 'components/typography/ContainerHeading';
import type { Collection } from '../types/Collection';
import type { State } from '../types/State';
import { selectSharedState } from '../selectors/shared';
import { selectors as collectionSelectors } from '../bundles/collectionsBundle';

type ContainerProps = {
  id: string, // eslint-disable-line react/no-unused-prop-types
  selectSharedState?: (state: any) => State // eslint-disable-line react/no-unused-prop-types
};

type Props = ContainerProps & {
  collection: Collection,
  headlineContent: ReactNode,
  children: ReactNode
};

const CollectionContainer = styled('div')`
  position: relative;
  background-color: white;
  padding: 0 10px 10px 10px;
  margin: 6px 5px 5px 5px;
  box-shadow: 0 -1px 0 #333;
  border-top: none;
  border-left: 1px solid #c9c9c9;
  border-right: 1px solid #c9c9c9;
  border-bottom: 1px solid #c9c9c9;
`;

const HeadlineContentContainer = styled('span')`
  position: absolute;
  right: 0px;
  top: 0px;
`;

const collectionDetail = ({ collection, headlineContent, children }: Props) => {
  return collection ? (
    <CollectionContainer>
      <ContainerHeading>
        {collection.displayName}
        {headlineContent && (
          <HeadlineContentContainer>{headlineContent}</HeadlineContentContainer>
        )}
      </ContainerHeading>
      <HorizontalRule />
      {children}
    </CollectionContainer>
  ) : (
    <span>Waiting for collection</span>
  );
};

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
