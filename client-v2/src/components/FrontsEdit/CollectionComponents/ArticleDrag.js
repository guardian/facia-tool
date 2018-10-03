// @flow

import React from 'react';
import { connect } from 'react-redux';
import {
  externalArticleFromArticleFragmentSelector,
  selectSharedState
} from 'shared/selectors/shared';
import type { State } from 'types/State';
import type { Article } from 'shared/types/Article';

type ContainerProps = {
  id: string // eslint-disable-line react/no-unused-prop-types
};

type ComponentProps = {
  article: ?Article
} & ContainerProps;

const ArticleDrag = ({ article }: ComponentProps) =>
  article && (
    <div
      style={{
        background: '#eee',
        borderRadius: '4px',
        dropShadow: '-2px -2px 5px 0 rgba(0, 0, 0, 0.5)',
        overflow: 'hidden',
        padding: '8px',
        textOverflow: 'ellipsis',
        width: '300px',
        whiteSpace: 'nowrap'
      }}
    >
      {article.headline}
    </div>
  );

// $FlowFixMe
const createMapStateToProps = () => (
  state: State,
  props: ContainerProps
): { article: ?Article } => ({
  article: externalArticleFromArticleFragmentSelector(
    selectSharedState(state),
    props.id
  )
});

export default connect(createMapStateToProps)(ArticleDrag);
