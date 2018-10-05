// @flow

import React, { type Node as ReactNode } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import noop from 'lodash/noop';
import truncate from 'lodash/truncate';
import { getThumbnailFromElements } from 'util/CAPIUtils';
import { optionize } from 'util/component';
import {
  articleFromArticleFragmentSelector,
  selectSharedState
} from '../selectors/shared';
import type { State } from '../types/State';
import type { DerivedArticle } from '../types/Article';

type ContainerProps = {
  id: string, // eslint-disable-line react/no-unused-prop-types
  draggable: boolean,
  onDragStart?: DragEvent => void,
  onDragOver?: DragEvent => void,
  onDrop?: DragEvent => void,
  onSelect: (id: string) => void,
  selectSharedState: (state: any) => State // eslint-disable-line react/no-unused-prop-types
};

type ComponentProps = {
  article: ?DerivedArticle,
  children?: ReactNode
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
      {...optionize(() => onSelect(id))}
    >
      <Thumbnail src={article.thumbnail} alt="" />
      {truncate(article.headline, { length: 45 })}
      {children}
    </BodyContainer>
  );
};

// $FlowFixMe
const createMapStateToProps = () => (
  state: State,
  props: ContainerProps
): { article: ?DerivedArticle } => ({
  article: articleFromArticleFragmentSelector(
    props.selectSharedState
      ? props.selectSharedState(state)
      : selectSharedState(state),
    props.id
  )
});

export default connect(createMapStateToProps)(ArticleComponent);
