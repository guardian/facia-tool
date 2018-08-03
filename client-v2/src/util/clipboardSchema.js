// @flow

import { createType, build } from 'normalise-with-fields';
import v4 from 'uuid/v4';
import { postProcessArticleFragment } from 'shared/util/schema';

const articleFragments = createType('articleFragments', {
  preProcess: af => ({
    ...af,
    uuid: v4()
  }),
  postProcess: postProcessArticleFragment,
  idKey: 'uuid'
});

const supportingArticles = createType('articleFragments', {
  preProcess: af => ({
    ...af,
    uuid: v4()
  }),
  postProcess: postProcessArticleFragment,
  idKey: 'uuid'
});

export const { normalize, denormalize } = build({
  articles: articleFragments({
    'meta.supporting': supportingArticles()
  })
});
