import { CapiArticleFields } from 'types/Capi';
import { ExternalArticle } from './ExternalArticle';
import { $Diff } from 'utility-types';
import { ArticleFragmentRootFields, ArticleFragmentMeta } from './Collection';

type DerivedArticle = $Diff<
  ExternalArticle,
  { fields: unknown; frontsMeta: unknown, type: unknown }
> &
  $Diff<CapiArticleFields,
  { isLive?: unknown }
  >&
  ArticleFragmentRootFields &
  ArticleFragmentMeta & {
    tone: string;
    thumbnail: string | void;
    kicker: string;
    isLive: boolean;
  };

export { DerivedArticle };
