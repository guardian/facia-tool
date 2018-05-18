// @flow

import * as React from 'react';
import { connect } from 'react-redux';

import Article from './Article';
import {
  createArticlesInCollectionGroupSelector,
  selectSharedState
} from '../selectors/shared';
import { State } from '../types/State';

type ContainerProps = {
  groupName: string,
  collectionId: string, // eslint-disable-line react/no-unused-prop-types
  stage: string, // eslint-disable-line react/no-unused-prop-types
  selectSharedState: (state: any) => State // eslint-disable-line react/no-unused-prop-types
};

type Props = ContainerProps & {
  articles: string[]
};

const GroupDisplayComponent = ({ groupName, articles }: Props) => (
  <div>
    <h3>{groupName}</h3>
    {articles.map(id => <Article key={id} id={id} />)}
  </div>
);

const createMapStateToProps = () => {
  const articlesSelector = createArticlesInCollectionGroupSelector();
  // $FlowFixMe
  return (state: RootState, props: ContainerProps): { articles: string[] } => ({
    articles: articlesSelector(
      props.selectSharedState
        ? props.selectSharedState(state)
        : selectSharedState(state),
      props
    )
  });
};

export default connect(createMapStateToProps)(GroupDisplayComponent);
