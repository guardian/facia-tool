// @flow

import * as React from 'react';
import { connect } from 'react-redux';

import { createArticlesInCollectionGroupSelector } from '../../selectors/shared';
import Article from './Article';

type Props = {
  articles: string[],
  group: string
};

const GroupDisplay = ({ group, articles }: Props) => (
  <span>
    {group}
    {articles.map(id => <Article id={id} />)}
  </span>
);

const createMapStateToProps = () => {
  const articlesSelector = createArticlesInCollectionGroupSelector();
  return (state: State, props: ContainerProps) => ({
    articles: articlesSelector(state, props)
  });
};

export default connect(createMapStateToProps)(GroupDisplay);
