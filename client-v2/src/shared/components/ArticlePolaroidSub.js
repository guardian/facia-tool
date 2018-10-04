// @flow

import React, { type Node as ReactNode } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import noop from 'lodash/noop';
import truncate from 'lodash/truncate';
import {
  externalArticleFromArticleFragmentSelector,
  selectSharedState
} from '../selectors/shared';
import type { State } from '../types/State';
import type { Article } from '../types/Article';
import toneColorMap from '../util/toneColorMap';

type ContainerProps = {
  id: string, // eslint-disable-line react/no-unused-prop-types
  draggable: boolean,
  onDragStart?: DragEvent => void,
  onDragOver?: DragEvent => void,
  onDrop?: DragEvent => void,
  selectSharedState: (state: any) => State // eslint-disable-line react/no-unused-prop-types
};

type ComponentProps = {
  article: ?Article,
  children?: ReactNode
} & ContainerProps;

const BodyContainer = styled('div')`
  cursor: pointer;
  font-size: 14px;
  position: relative;
`;

const TonedKicker = styled('span')`
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

// $FlowFixMe
const createMapStateToProps = () => (
  state: State,
  props: ContainerProps
): { article: ?Article } => ({
  article: externalArticleFromArticleFragmentSelector(
    props.selectSharedState
      ? props.selectSharedState(state)
      : selectSharedState(state),
    props.id
  )
});

export default connect(createMapStateToProps)(ArticleComponent);
