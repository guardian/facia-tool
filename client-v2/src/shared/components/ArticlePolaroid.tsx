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

type ContainerProps = {
  id: string; // eslint-disable-line react/no-unused-prop-types
  draggable: boolean;
  onDragStart?: (d: React.DragEvent<HTMLElement>) => void;
  onDragOver?: (d: React.DragEvent<HTMLElement>) => void;
  onDrop?: (d: React.DragEvent<HTMLElement>) => void;
  onSelect: (id: string) => void;
  selectSharedState?: (state: any) => State; // eslint-disable-line react/no-unused-prop-types
};

type ComponentProps = {
  article: DerivedArticle | void;
  children?: React.ReactNode;
} & ContainerProps;

const BodyContainer = styled('div')`
  font-size: 14px;
  position: relative;
  cursor: pointer;
`;

const Thumbnail = styled('img')`
  width: 100%;
`;

const ArticleComponent = ({
  article,
  id,
  children,
  draggable = false,
  onDragStart = noop,
  onDragOver = noop,
  onDrop = noop,
  onSelect = noop
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
      onClick={() => onSelect(id)}
    >
      {article.thumbnail && <Thumbnail src={article.thumbnail} alt="" />}
      {truncate(article.headline, { length: 45 })}
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
