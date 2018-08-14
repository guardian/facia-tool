// @flow

import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import noop from 'lodash/noop';
import truncate from 'lodash/truncate';

import { getThumbnail } from 'util/CAPIUtils';
import {
  externalArticleFromArticleFragmentSelector,
  selectSharedState
} from '../selectors/shared';
import Clearfix from './layout/Clearfix';
import type { State } from '../types/State';
import type { Article } from '../types/Article';

type ContainerProps = {
  id: string, // eslint-disable-line react/no-unused-prop-types
  draggable: boolean,
  onDragStart?: DragEvent => void,
  selectSharedState: (state: any) => State // eslint-disable-line react/no-unused-prop-types
};

type ComponentProps = {
  article: ?Article
} & ContainerProps;

const BodyContainer = Clearfix.extend`
  position: relative;
  cursor: pointer;
`;

const Thumbnail = styled('img')`
  width: 100%;
`;

const ArticleComponent = ({
  article,
  draggable = false,
  onDragStart = noop
}: ComponentProps) => {
  if (!article) {
    return null;
  }

  return (
    <BodyContainer draggable={draggable} onDragStart={onDragStart}>
      {article.elements && (
        <Thumbnail src={getThumbnail(article.elements)} alt="" />
      )}
      {truncate(article.headline, { length: 45 })}
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
