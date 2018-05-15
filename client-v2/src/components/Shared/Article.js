// @flow

import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';

import { createArticleFromArticleFragmentSelector } from 'selectors/shared';
import type { State } from 'types/State';
import type { ExternalArticleWithMetadata } from 'types/Shared';

type ContainerProps = {
  id: string // eslint-disable-line react/no-unused-prop-types
};

type ComponentProps = {
  article: ExternalArticleWithMetadata
} & ContainerProps;

const ArticleContainer = styled('div')`
  padding: 5px;
`;

const Article = ({ article }: ComponentProps) =>
  article && (
    <ArticleContainer key={article.headline}>
      {article.headline}
    </ArticleContainer>
  );

const createMapStateToProps = () => {
  const selectArticle = createArticleFromArticleFragmentSelector();
  return (state: State, { id }: ContainerProps) => ({
    article: selectArticle(state, id)
  });
};

export default connect(createMapStateToProps)(Article);
