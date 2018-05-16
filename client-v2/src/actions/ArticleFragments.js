import type { Action } from '../types/Action';
import type { ArticleFragment } from '../types/Shared';

function articleFragmentsReceived(articleFragments: {
  [string]: ArticleFragment
}): Action {
  return {
    type: 'SHARED/ARTICLE_FRAGMENTS_RECEIVED',
    payload: articleFragments
  };
}

export { articleFragmentsReceived };
