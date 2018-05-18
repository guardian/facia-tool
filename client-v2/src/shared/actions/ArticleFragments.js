import type { ArticleFragment } from 'shared/types/Collection';
import type { Action } from '../types/Action';

function articleFragmentsReceived(articleFragments: {
  [string]: ArticleFragment
}): Action {
  return {
    type: 'SHARED/ARTICLE_FRAGMENTS_RECEIVED',
    payload: articleFragments
  };
}

export { articleFragmentsReceived };
