// @flow

import * as React from 'react';
import type { CapiArticleWithMetadata } from 'Types/Capi';
import { getArticlesInGroup } from 'Util/articleUtils';
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
