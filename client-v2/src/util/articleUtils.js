// @flow

import type { CapiArticle, CapiArticleWithMetadata } from 'Types/Capi';
import type { Article } from 'Types/Article';

const getArticlesWithMeta = (
  articles: Array<Article>,
  capiArticles: Array<CapiArticle>
): Array<CapiArticleWithMetadata> =>
  articles.map(article => {
    const group = (article.meta && article.meta.group) || undefined;
    const articleId = article.id.split('/')[2];
    const capiArticle = capiArticles.find(capi => capi.id === articleId);
    return Object.assign({}, capiArticle, { group });
  });

const getArticlesInGroup = (
  groupIndex: number,
  numberOfGroups: number,
  articles: Array<CapiArticleWithMetadata>
) => {
  // We have reversed the groups in the iterator
  const groupNumber = numberOfGroups - groupIndex - 1;
  return articles.filter(article => {
    const articleGroup = article.group ? parseInt(article.group, 10) : 0;
    return articleGroup === groupNumber;
  });
};

export { getArticlesWithMeta, getArticlesInGroup };
