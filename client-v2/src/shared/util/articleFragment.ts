import v4 from 'uuid/v4';
import { ArticleFragment } from 'shared/types/Collection';

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
  fragment: ArticleFragment,
  fragments: { [id: string]: ArticleFragment } // all the article fragments to enable nested rebuilds
): { parent: ArticleFragment; supporting: ArticleFragment[] } => {
  const sup = (fragment.meta.supporting || [])
    .map(id => {
      const supportingFragment = fragments[id];
      const { supporting, ...meta } = supportingFragment.meta;
      return cloneFragment(
        {
          ...supportingFragment,
          meta
        },
        fragments
      ).parent;
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
