// @flow

import React from 'react';
import styled from 'styled-components';

import type { CapiArticleWithMetadata } from 'types/Capi';
import CollectionArticles from './CollectionArticles';
import GroupDisplay from './GroupDisplay';

type Props = {
  displayName: string,
  articles: Array<CapiArticleWithMetadata>,
  groups?: Array<string>
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

const CollectionDetail = (props: Props) => (
  <CollectionContainer>
    <CollectionHeadline>{props.displayName}</CollectionHeadline>
    {props.groups ? (
      <GroupDisplay articles={props.articles} groups={props.groups} />
    ) : (
      <CollectionArticles articles={props.articles} />
    )}
  </CollectionContainer>
);

export default CollectionDetail;
