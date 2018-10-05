// @flow

import type { ExternalArticle } from './ExternalArticle';
import type {
  ArticleFragmentRootFields,
  ArticleFragmentMeta
} from './Collection';

type Article = ExternalArticle &
  ArticleFragmentRootFields &
  ArticleFragmentMeta;

export type { Article };
