import { createType, build } from 'normal';
import v4 from 'uuid/v4';

const getLastPartOfArticleFragmentId = (id: string) => id.split('/').pop();

const collections = createType('collections');
const articleFragments = createType('articleFragments', {
  preProcess: af => ({
    ...af,
    uuid: v4(),
    id: getLastPartOfArticleFragmentId(af.id)
  }),
  idKey: 'uuid'
});
const supportingArticles = createType('articleFragments', {
  preProcess: af => ({
    ...af,
    uuid: v4(),
    id: getLastPartOfArticleFragmentId(af.id)
  }),
  idKey: 'uuid'
});

export const { normalize, denormalize } = build(
  collections({
    live: articleFragments({
      'meta.supporting': supportingArticles()
    }),
    previously: articleFragments({
      'meta.supporting': supportingArticles()
    }),
    draft: articleFragments({
      'meta.supporting': supportingArticles()
    })
  })
);
