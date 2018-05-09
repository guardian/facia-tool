// @flow

import * as React from 'react';
import type { CapiArticleWithMetadata } from 'types/Capi';
import { getArticlesInGroup } from 'util/articleUtils';
import CollectionArticles from './CollectionArticles';

type Props = {
  groups: Array<string>,
  articles: Array<CapiArticleWithMetadata>
};

const GroupDisplay = (props: Props): Array<React.Node> => {
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
