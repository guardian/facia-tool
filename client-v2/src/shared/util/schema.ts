import { createType, build, createFieldType } from 'normalise-with-fields';
import v4 from 'uuid/v4';
import { ArticleFragment } from 'shared/types/Collection';

const postProcessArticleFragment = (
  articleFragment: ArticleFragment
): object => {
  const { uuid, ...af } = articleFragment;

  let meta = { ...af.meta };

  if (!(meta.supporting || []).length) {
    const { supporting, ...rest } = meta;
    meta = rest;
  }

  if (!meta.group || meta.group === '0') {
    const { group, ...rest } = meta;
    meta = rest;
  }

  return {
    ...af,
    meta
  };
};

const articleFragments = createType('articleFragments', {
  preProcess: (af: ArticleFragment) => ({
    ...af,
    uuid: v4()
  }),
  postProcess: postProcessArticleFragment,
  idKey: 'uuid',
  field: createFieldType('groups', {
    key: 'meta.group',
    valueKey: 'id',
    uuid: v4
  })
});
const supportingArticles = createType('articleFragments', {
  preProcess: (af: ArticleFragment) => ({
    ...af,
    uuid: v4()
  }),
  postProcess: postProcessArticleFragment,
  idKey: 'uuid'
});

export const { normalize, denormalize } = build({
  live: articleFragments({
    'meta.supporting': supportingArticles()
  }),
  previously: articleFragments({
    'meta.supporting': supportingArticles()
  }),
  draft: articleFragments({
    'meta.supporting': supportingArticles()
  })
});

export { postProcessArticleFragment, supportingArticles };
