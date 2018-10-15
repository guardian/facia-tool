import React from 'react';
import { connect } from 'react-redux';
import {
  articleFromArticleFragmentSelector,
  selectSharedState
} from 'shared/selectors/shared';
import { State } from 'types/State';
import { DerivedArticle } from 'shared/types/Article';

type ContainerProps = {
  id: string;
};

type ComponentProps = {
  article: DerivedArticle | void;
} & ContainerProps;

const ArticleDrag = ({ article }: ComponentProps) => (
  <>
    {article && (
      <div
        style={{
          background: '#eee',
          borderRadius: '4px',
          boxShadow: '-2px -2px 5px 0 rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          padding: '8px',
          textOverflow: 'ellipsis',
          width: '300px',
          whiteSpace: 'nowrap'
        }}
      >
        {article.headline}
      </div>
    )}
  </>
);

const createMapStateToProps = () => (
  state: State,
  props: ContainerProps
): { article: DerivedArticle | void } => ({
  article: articleFromArticleFragmentSelector(
    selectSharedState(state),
    props.id
  )
});

export default connect(createMapStateToProps)(ArticleDrag);
