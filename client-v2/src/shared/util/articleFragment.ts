import v4 from 'uuid/v4';
import omit from 'lodash/omit';
import { ArticleFragment } from 'shared/types/Collection';
import { ArticleFragmentTree } from 'shared/selectors/shared';

const createFragment = (id: string, supporting: string[] = []) => ({
  uuid: v4(),
  id,
  frontPublicationDate: Date.now(),
  meta: {
    supporting
  }
});

// only go one deep
const cloneFragment = (
  fragment: ArticleFragmentTree
): { parent: ArticleFragment; supporting: ArticleFragment[] } => {
  const sup = (fragment.meta.supporting || [])
    .map(af => {
      const { supporting, ...meta } = af.meta;
      return cloneFragment({
        ...af,
        meta
      }).parent;
    })
    .filter((s: ArticleFragment): s is ArticleFragment => !!s);

  return {
    parent: {
      ...fragment,
      uuid: v4(),
      meta: {
        ...fragment.meta,
        supporting: sup.map(({ uuid }) => uuid)
      }
    },
    supporting: sup
  };
};

export { createFragment, cloneFragment };
