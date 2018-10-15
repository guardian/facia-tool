import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import noop from 'lodash/noop';
import truncate from 'lodash/truncate';
import {
  articleFromArticleFragmentSelector,
  selectSharedState
} from '../selectors/shared';
import { State } from '../types/State';
import { DerivedArticle } from '../types/Article';
import toneColorMap from '../util/toneColorMap';

type ContainerProps = {
  id: string;
  draggable: boolean;
  onDragStart?: (d: React.DragEvent<HTMLDivElement>) => void;
  onDragOver?: (d: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (d: React.DragEvent<HTMLDivElement>) => void;
  selectSharedState: (state: any) => State;
};

type ComponentProps = {
  article: DerivedArticle | void;
  children?: React.ReactNode;
} & ContainerProps;

const BodyContainer = styled('div')`
  cursor: pointer;
  font-size: 14px;
  position: relative;
`;

const TonedKicker = styled('span')<{ tone: string }>`
  color: ${({ tone }) => toneColorMap[tone] || 'inherit'};
  font-size: 13px;
  font-weight: 700;
`;

const ArticleComponent = ({
  article,
  children,
  draggable = false,
  onDragStart = noop,
  onDragOver = noop,
  onDrop = noop
}: ComponentProps) => {
  if (!article) {
    return null;
  }

  return (
    <BodyContainer
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <TonedKicker tone={article.tone}>{article.sectionName}</TonedKicker>
      {` ${truncate(article.headline, {
        length: 40 - article.sectionName.length
      })}`}
      {children}
    </BodyContainer>
  );
};

const createMapStateToProps = () => (
  state: State,
  props: ContainerProps
): { article: DerivedArticle | void } => ({
  article: articleFromArticleFragmentSelector(
    props.selectSharedState
      ? props.selectSharedState(state)
      : selectSharedState(state),
    props.id
  )
});

export default connect(createMapStateToProps)(ArticleComponent);
