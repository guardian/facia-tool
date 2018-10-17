import { createType, build, createFieldType } from 'normalise-with-fields';
import v4 from 'uuid/v4';
import { ArticleFragment } from 'shared/types/Collection';

const preProcessArticleFragment = (
  articleFragment: ArticleFragment
): object => ({
  ...articleFragment,
  // guard against missing meta from the server
  meta: articleFragment.meta || {},
  uuid: v4()
});

const postProcessArticleFragment = (
  articleFragment: ArticleFragment
): object => {
  const { uuid, ...af } = articleFragment;

  let meta = { ...af.meta };

  // if we have no supporting when denormalizing then remove that from the meta
  if (!(meta.supporting || []).length) {
    const { supporting, ...rest } = meta;
    meta = rest;
  }

  // if our group is 0 or falsey when denormalizing then remove that form the meta
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
  preProcess: preProcessArticleFragment,
  postProcess: postProcessArticleFragment,
  idKey: 'uuid',
  field: createFieldType('groups', {
    key: 'meta.group',
    valueKey: 'id',
    uuid: v4,
    defaultValue: '0'
  })
});
const supportingArticles = createType('articleFragments', {
  preProcess: preProcessArticleFragment,
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
