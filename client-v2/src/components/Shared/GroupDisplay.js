// @flow

import * as React from 'react';
import CollectionArticles from './CollectionArticles';
import type { ExternalArticleWithMetadata } from '../../types/Shared';
import { getArticlesInGroup } from '../../util/articleUtils';

type Props = {
  groups: Array<string>,
  articles: Array<ExternalArticleWithMetadata>
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
