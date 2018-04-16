// @flow

import React from 'react';
import styled from 'styled-components';

import type {
  ConfigCollectionDetailWithId,
  CapiArticle
} from '../../types/Fronts';

type Props = {
  collectionConfig: ConfigCollectionDetailWithId,
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
    <CollectionHeadline>
      {props.collectionConfig.displayName}
    </CollectionHeadline>
    {props.articles.map(article => (
      <ArticleContainer key={article.headline}>
        {article.headline}
      </ArticleContainer>
    ))}
  </CollectionContainer>
);

export default CollectionDetail;
