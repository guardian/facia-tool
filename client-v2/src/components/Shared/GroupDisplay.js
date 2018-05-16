// @flow

import * as React from 'react';
import { connect } from 'react-redux';

import { createArticlesInCollectionGroupSelector } from '../../selectors/shared';
import Article from './Article';

type ContainerProps = {
  groupName: string,
  collectionId: string, // eslint-disable-line react/no-unused-prop-types
  stage: string // eslint-disable-line react/no-unused-prop-types
};

type Props = ContainerProps & {
  articles: string[]
};

const GroupDisplay = ({ groupName, articles }: Props) => (
  <div>
    <h3>{groupName}</h3>
    {articles.map(id => <Article key={id} id={id} />)}
  </div>
);

const createMapStateToProps = () => {
  const articlesSelector = createArticlesInCollectionGroupSelector();
  return (state: State, props: ContainerProps) => ({
    articles: articlesSelector(state, props)
  });
};

export default connect(createMapStateToProps)(GroupDisplay);
