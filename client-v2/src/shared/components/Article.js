// @flow

import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';

import {
  createArticleFromArticleFragmentSelector,
  selectSharedState
} from '../selectors/shared';
import type { State } from '../types/State';
import type { Article } from '../types/Article';

type ContainerProps = {
  id: string, // eslint-disable-line react/no-unused-prop-types
  selectSharedState: (state: any) => State // eslint-disable-line react/no-unused-prop-types
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
  return (state: State, props: ContainerProps): { article: Article } => ({
    article: selectArticle(
      props.selectSharedState
        ? props.selectSharedState(state)
        : selectSharedState(state),
      props.id
    )
  });
};

export default connect(createMapStateToProps)(ArticleComponent);
