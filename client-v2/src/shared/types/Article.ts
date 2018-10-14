import { CapiArticleFields } from 'types/Capi';
import { ExternalArticle } from './ExternalArticle';
import { $Diff } from 'utility-types';
import { ArticleFragmentRootFields, ArticleFragmentMeta } from './Collection';

type DerivedArticle = $Diff<
  ExternalArticle,
  { fields: any; blocks: any; tags?: any; elements: any; frontsMeta: any }
> &
  CapiArticleFields &
  ArticleFragmentRootFields &
  ArticleFragmentMeta & {
    tone: string;
    thumbnail: string | void;
    kicker: string;
  };

export { DerivedArticle };
