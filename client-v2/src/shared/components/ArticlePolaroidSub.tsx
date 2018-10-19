import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import noop from 'lodash/noop';
import truncate from 'lodash/truncate';
import {
  createArticleFromArticleFragmentSelector,
  selectSharedState
} from '../selectors/shared';
import { State } from '../types/State';
import { DerivedArticle } from '../types/Article';
import toneColorMap from '../util/toneColorMap';
import ButtonDefault from './input/ButtonDefault';
import { removeSupportingArticleFragmentFromClipboard } from 'actions/ArticleFragments';
import { Dispatch } from 'types/Store';

interface ContainerProps {
  id: string;
  parentId: string;
  children?: React.ReactNode;
  draggable: boolean;
  onDragStart?: (d: React.DragEvent<HTMLElement>) => void;
  onDragOver?: (d: React.DragEvent<HTMLElement>) => void;
  onDrop?: (d: React.DragEvent<HTMLElement>) => void;
  selectSharedState?: (state: any) => State;
}

type ComponentProps = {
  article: DerivedArticle | void;
  onDelete: () => void;
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
  onDrop = noop,
  onDelete
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
      <ButtonDefault
        onClick={e => {
          e.stopPropagation();
          onDelete();
        }}
        inline
        pill
        size="s"
        priority="muted"
      >
        Delete
      </ButtonDefault>
    </BodyContainer>
  );
};

const createMapStateToProps = () => {
  const articleSelector = createArticleFromArticleFragmentSelector();
  return (
    state: State,
    props: ContainerProps
  ): { article: DerivedArticle | void } => ({
    article: articleSelector(
      props.selectSharedState
        ? props.selectSharedState(state)
        : selectSharedState(state),
      props.id
    )
  });
};

const mapDispatchToProps = (
  dispatch: Dispatch,
  { id, parentId }: ContainerProps
) => ({
  onDelete: () =>
    dispatch(removeSupportingArticleFragmentFromClipboard(parentId, id))
});

export default connect(
  createMapStateToProps,
  mapDispatchToProps
)(ArticleComponent);
