// @flow

import React, { type Node as ReactNode } from 'react';
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
  draggable: boolean,
  onDragStart: ?(DragEvent) => void,
  selectSharedState: (state: any) => State // eslint-disable-line react/no-unused-prop-types
};

type ComponentProps = {
  article: Article,
  children: ReactNode
} & ContainerProps;

const ArticleContainer = styled('div')`
  padding: 5px;
`;

const ArticleComponent = ({
  article,
  draggable,
  onDragStart,
  children
}: ComponentProps) =>
  article && (
    <ArticleContainer key={article.headline}>
      <div draggable={draggable} onDragStart={onDragStart}>
        {article.headline}
      </div>
      <div>
        {!article.isLive &&
          (article.firstPublicationDate ? 'Taken Down' : 'Draft')}
      </div>
      {children}
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

ArticleComponent.defaultProps = {
  draggable: false,
  onDragStart: null
};

export default connect(createMapStateToProps)(ArticleComponent);
