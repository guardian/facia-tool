// @flow

import React from 'react';
import styled from 'styled-components';

import type { CapiArticle } from '../../types/Capi';

type Props = {
  displayName: string,
  articles: Array<CapiArticle>
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

const ArticleContainer = styled('div')`
  padding: 5px;
`;

const CollectionDetail = (props: Props) => (
  <CollectionContainer>
    <CollectionHeadline>{props.displayName}</CollectionHeadline>
    {props.articles.map(article => (
      <ArticleContainer key={article.headline}>
        {article.headline}
      </ArticleContainer>
    ))}
  </CollectionContainer>
);

export default CollectionDetail;
