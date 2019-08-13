import {
  CollectionWithArticles,
  ArticlePathAndId
} from 'shared/types/PageViewData';
import { ArticleFragment, Stages } from 'shared/types/Collection';
import { DerivedArticle } from 'shared/types/Article';
import {
  selectArticleFragment,
  selectSharedState
} from 'shared/selectors/shared';
import { Store } from 'types/Store';
import {
  createSelectArticlesInCollection,
  createSelectArticleFromArticleFragment
} from 'shared/selectors/shared';

const selectAllArticleIdsForCollection = createSelectArticlesInCollection();
const selectArticle = createSelectArticleFromArticleFragment();

const retrieveCollectionsWithTheirArticles = (
  store: Store,
  openCollectionIds: string[],
  browsingStage: Stages = 'draft'
): CollectionWithArticles[] => {
  const state = store.getState();

  return openCollectionIds.map((cId: string) => {
    const allArticleIds: string[] = selectAllArticleIdsForCollection(
      selectSharedState(state),
      {
        collectionId: cId,
        collectionSet: browsingStage,
        includeSupportingArticles: false
      }
    );
    const allArticleFrags: ArticleFragment[] = allArticleIds.map(articleId =>
      selectArticleFragment(selectSharedState(state), articleId)
    );
    const allArticles: Array<DerivedArticle | undefined> = allArticleFrags.map(
      frag => selectArticle(selectSharedState(state), frag.uuid)
    );

    const allArticlePathsAndIds: ArticlePathAndId[] = allArticles.reduce(
      (acc, article) => {
        if (article && article.urlPath) {
          acc.push({
            articlePath: article.urlPath,
            articleId: article.uuid
          });
        }
        return acc;
      },
      [] as ArticlePathAndId[]
    );

    return {
      id: cId,
      articles: allArticlePathsAndIds
    };
  });
};

export { retrieveCollectionsWithTheirArticles };
