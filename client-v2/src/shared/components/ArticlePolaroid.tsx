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
import { Dispatch } from 'types/Store';
import { removeArticleFragmentFromClipboard } from 'actions/ArticleFragments';
import Button from './input/ButtonDefault';
import { ArticleComponentProps } from './Article';
import Fadeable from './Fadeable';

interface ContainerProps extends ArticleComponentProps {
  isSelected?: boolean;
  onSelect?: (uuid: string) => void;
  selectSharedState?: (state: any) => State;
  children?: React.ReactNode;
}

type ComponentProps = {
  article: DerivedArticle | void;
  onDelete: () => void;
} & ContainerProps;

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

const ArticleComponent = ({
  article,
  id,
  children,
  draggable = false,
  onDragStart = noop,
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
        {truncate(article.headline, { length: 45 })}
      </Fadeable>
      >>>>>>> Add handlers and state to clipboard
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

const mapDispatchToProps = (dispatch: Dispatch, { id }: ContainerProps) => ({
  onDelete: () => dispatch(removeArticleFragmentFromClipboard(id))
});

export default connect(
  createMapStateToProps,
  mapDispatchToProps
)(ArticleComponent);
