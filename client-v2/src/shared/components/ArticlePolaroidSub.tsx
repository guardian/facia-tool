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
import { getToneColor, toneColorMap } from 'shared/util/toneColorMap';
import ButtonDefault from './input/ButtonDefault';
import { removeSupportingArticleFragmentFromClipboard } from 'actions/ArticleFragments';
import { Dispatch } from 'types/Store';
import { ArticleComponentProps } from './Article';
import Fadeable from './Fadeable';

interface ContainerProps extends ArticleComponentProps {
  children?: React.ReactNode;
  parentId: string;
  isSelected?: boolean;
  onSelect?: (uuid: string) => void;
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
  onDragEnter = noop,
  onDragOver = noop,
  onDrop = noop,
  isSelected,
  onSelect = noop,
  onDelete = noop
}: ComponentProps) => {
  if (!article) {
    return null;
  }

  return (
    <BodyContainer
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={() => onSelect(article.uuid)}
    >
      <Fadeable fade={!isSelected}>
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
        <TonedKicker tone={article.tone}>{article.sectionName}</TonedKicker>
        {` ${truncate(article.headline, {
          length: 40 - article.sectionName.length
        })}`}
      </Fadeable>
      {children}
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
  { id, parentId, onDelete = noop }: ContainerProps
) => ({
  onDelete: () => {
    onDelete(id);
    dispatch(removeSupportingArticleFragmentFromClipboard(parentId, id));
  }
});

export default connect(
  createMapStateToProps,
  mapDispatchToProps
)(ArticleComponent);
