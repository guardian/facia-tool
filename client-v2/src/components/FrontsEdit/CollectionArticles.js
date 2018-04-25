// @flow

import React from 'react';
import styled from 'styled-components';

import type { CapiArticleWithMetadata } from '../../types/Capi';

type Props = {
  articles: Array<CapiArticleWithMetadata>
};

const ArticleContainer = styled('div')`
  padding: 5px;
`;

const CollectionArticles = (props: Props) => (
  <div>
    {props.articles.map(article => (
      <ArticleContainer key={article.headline}>
        {article.headline}
      </ArticleContainer>
    ))}
  </div>
);

export default CollectionArticles;
