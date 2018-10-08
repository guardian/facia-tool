// @flow

import type { CapiArticleFields } from 'types/Capi';
import type { ExternalArticle } from './ExternalArticle';
import type {
  ArticleFragmentRootFields,
  ArticleFragmentMeta
} from './Collection';

type Article = $Diff<
  ExternalArticle,
  { fields: any, blocks: any, tags: any, elements: any, frontsMeta: any }
> &
  CapiArticleFields &
  ArticleFragmentRootFields &
  ArticleFragmentMeta & {
    tone: string
  };

export type { Article };
