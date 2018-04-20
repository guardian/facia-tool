// @flow

import React from 'react';
import CollectionArticles from './CollectionArticles';
import type { CapiArticleWithMetadata } from '../../types/Capi';
import { getArticlesInGroup } from '../../util/articleUtils';

type Props = {
  groups: Array<string>,
  articles: Array<CapiArticleWithMetadata>
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
