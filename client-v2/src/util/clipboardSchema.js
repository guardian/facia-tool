// @flow

import { createType, build } from 'normalise-with-fields';
import v4 from 'uuid/v4';

// TODO Some of this code can be shared with the collection normalisation code once
// that pr has been merged

const postProcessArticleFragment = (_af: {
  uuid?: string,
  meta?: { supporting?: mixed[] }
}): Object => {
  const { uuid, ...af } = _af;

  let meta = { ...af.meta };

  if (!(meta.supporting || []).length) {
    const { supporting, ...rest } = meta;
    meta = rest;
  }

  return {
    ...af,
    meta
  };
};

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
