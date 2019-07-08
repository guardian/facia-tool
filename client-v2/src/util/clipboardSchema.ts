import { createType, build } from 'normalise-with-fields';
import v4 from 'uuid/v4';
import {
  postProcessArticleFragment,
  supportingArticles
} from 'shared/util/schema';
import { ArticleFragment } from 'shared/types/Collection';

const articleFragments = createType('articleFragments', {
  preProcess: (af: ArticleFragment) => ({
    ...af,
    uuid: v4()
  }),
  postProcess: postProcessArticleFragment,
  idKey: 'uuid'
});

export const { normalize, denormalize } = build({
  frontsClipboard: articleFragments({
    'meta.supporting': supportingArticles()
  }),
  editionsClipboard: articleFragments({
    'meta.supporting': supportingArticles()
  })
});
