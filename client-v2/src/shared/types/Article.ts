

import { CapiArticleFields } from 'types/Capi';
import { ExternalArticle } from './ExternalArticle';
import {
  ArticleFragmentRootFields,
  ArticleFragmentMeta
} from './Collection';

type DerivedArticle = $Diff<
  ExternalArticle,
  { fields: any, blocks: any, tags: any, elements: any, frontsMeta: any }
> &
  CapiArticleFields &
  ArticleFragmentRootFields &
  ArticleFragmentMeta & {
    tone: string,
    thumbnail: string,
    kicker: string
  };

export { DerivedArticle };
