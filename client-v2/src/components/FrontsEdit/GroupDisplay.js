// @flow

import React from 'react';
import CollectionArticles from './CollectionArticles';
import type { CapiArticleWithMetadata } from '../../types/Capi';

type Props = {
  groups: Array<string>,
  articles: Array<CapiArticleWithMetadata>
};

const getArticlesInGroup = (groupIndex, numberOfGroups, articles) => {
  // We have reversed the groups in the iterator
  const groupNumber = numberOfGroups - groupIndex - 1;
  return articles.filter(article => {
    const articleGroup = article.group ? parseInt(article.group, 10) : 0;
    return articleGroup === groupNumber;
  });
};

const GroupDisplay = (props: Props) => {
  const groupsInOrder = props.groups.slice().reverse();

  return groupsInOrder.map((group, index) => (
    <div key={group}>
      {group}
      <CollectionArticles
        groupName={group}
        articles={getArticlesInGroup(
          index,
          props.groups.length,
          props.articles
        )}
      />
    </div>
  ));
};

export default GroupDisplay;
