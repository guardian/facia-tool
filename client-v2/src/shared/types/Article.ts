import { CapiArticleFields } from 'types/Capi';
import { ExternalArticle } from './ExternalArticle';
import { $Diff } from 'utility-types';
import { ArticleFragmentRootFields, ArticleFragmentMeta } from './Collection';

type DerivedArticle = $Diff<
  ExternalArticle,
  { fields: unknown; blocks: unknown; tags?: unknown; elements: unknown; frontsMeta: unknown }
> &
  CapiArticleFields &
  ArticleFragmentRootFields &
  ArticleFragmentMeta & {
    tone: string;
    thumbnail: string | void;
    kicker: string;
  };

export { DerivedArticle };
