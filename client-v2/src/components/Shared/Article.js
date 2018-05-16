// @flow

import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';

import { createArticleFromArticleFragmentSelector } from 'selectors/shared';
import type { State } from 'types/State';
import type { Article } from 'types/Shared';

type ContainerProps = {
  id: string // eslint-disable-line react/no-unused-prop-types
};

type ComponentProps = {
  article: Article
} & ContainerProps;

const ArticleContainer = styled('div')`
  padding: 5px;
`;

const ArticleComponent = ({ article }: ComponentProps) =>
  article && (
    <ArticleContainer key={article.headline}>
      {article.headline}
    </ArticleContainer>
  );

const createMapStateToProps = () => {
  const selectArticle = createArticleFromArticleFragmentSelector();
  // $FlowFixMe
  return (state: State, { id }: ContainerProps): { article: Article } => ({
    article: selectArticle(state, id)
  });
};

export default connect(createMapStateToProps)(ArticleComponent);
