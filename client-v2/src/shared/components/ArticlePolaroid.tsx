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
import { Dispatch } from 'types/Store';
import { removeArticleFragmentFromClipboard } from 'actions/ArticleFragments';
import Button from './input/ButtonDefault';
import { ArticleComponentProps } from './Article';
import Fadeable from './Fadeable';
import { getToneColor } from 'shared/util/toneColorMap';
import { getArticleLabel } from 'util/clipboardUtils';
import { notLiveLabels } from 'constants/fronts';

interface ContainerProps {
  id: string; // eslint-disable-line react/no-unused-prop-types
  draggable: boolean;
  isSelected?: boolean;
  onDragStart?: (d: React.DragEvent<HTMLElement>) => void;
  onDragEnter?: (d: React.DragEvent<HTMLElement>) => void;
  onDragEnd?: (d: React.DragEvent<HTMLElement>) => void;
  onDragOver?: (d: React.DragEvent<HTMLElement>) => void;
  onDrop?: (d: React.DragEvent<HTMLElement>) => void;
  onSelect: (uuid: string) => void;
  selectSharedState?: (state: any) => State; // eslint-disable-line react/no-unused-prop-types
  children?: React.ReactNode;
  onDelete: (uuid: string) => void;
}

type ComponentProps = ContainerProps & {
  article: DerivedArticle | void;
  onDelete: () => void;
};

const CornerButton = Button.extend`
  left: 4px;
  position: absolute;
  top: 4px;
`;

const BodyContainer = styled('div')`
  font-size: 14px;
  position: relative;
  cursor: pointer;
`;

const Thumbnail = styled('img')`
  width: 100%;
`;

const TonedKicker = styled('span')<{ tone: string, isLive: boolean }>`
  color: ${({ tone, isLive }) => getToneColor(tone, isLive) || 'inherit'};
  font-size: 13px;
  font-weight: bold;
`;


const ArticleComponent = ({
  article,
  id,
  children,
  draggable = false,
  onDragStart = noop,
  onDragEnter = noop,
  onDragEnd = noop,
  onDragOver = noop,
  onDrop = noop,
  onDelete = noop,
  onSelect = noop,
  isSelected
}: ComponentProps) => {
  if (!article) {
    return null;
  }

  return (
    <BodyContainer
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <Fadeable onClick={() => onSelect(id)} fade={!isSelected}>
        <CornerButton
          onClick={e => {
            e.stopPropagation();
            onDelete();
          }}
          pill
          priority="muted"
          size="s"
        >
          Delete
        </CornerButton>
        {article.thumbnail && <Thumbnail src={article.thumbnail} alt="" />}
        <TonedKicker tone={article.tone} isLive={article.isLive}>{ getArticleLabel(article) }</TonedKicker>
        {` ${truncate(article.headline, {
          length: 45 - getArticleLabel(article).length
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
  { id, onDelete = noop }: ContainerProps
) => ({
  onDelete: () => {
    onDelete(id);
    dispatch(removeArticleFragmentFromClipboard(id));
  }
});

export default connect(
  createMapStateToProps,
  mapDispatchToProps
)(ArticleComponent);
