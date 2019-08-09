import { State } from '../../../types/State';
import {
  PageViewDataPerFront,
  PageViewDataPerCollection,
  CollectionWithArticles,
  ArticlePathAndId
} from 'shared/types/PageViewData';
import { ArticleFragment } from 'shared/types/Collection';
import { DerivedArticle } from 'shared/types/Article';
import {
  selectArticleFragment,
  selectSharedState,
  createSelectArticlesInCollection,
  createSelectArticleFromArticleFragment
} from 'shared/selectors/shared';
import { Store } from 'types/Store';

const selectPageViewDataForArticlePath = (state: State, url: string) =>
  selectPageViewData(state);

const selectPageViewData = (state: State): PageViewDataPerFront =>
  state.shared.pageViewData;

const selectPageViewDataForCollection = (
  state: State,
  collectionId: string
): PageViewDataPerCollection | undefined =>
  state.shared.pageViewData &&
  state.shared.pageViewData.collections &&
  state.shared.pageViewData.collections.find(
    c => c.collectionId === collectionId
  );

const selectAllArticleIds = createSelectArticlesInCollection();
const selectArticle = createSelectArticleFromArticleFragment();

const selectAllCollectionWithArticles = (
  store: Store,
  openCollectionIds: string[]
): CollectionWithArticles[] => {
  const state = store.getState();

  return openCollectionIds.map((cId: string) => {
    const allArticleIds: string[] = selectAllArticleIds(
      selectSharedState(state),
      {
        collectionId: cId,
        collectionSet: 'draft', // need to obtain this from the store
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

export {
  selectPageViewData,
  selectPageViewDataForArticlePath,
  selectPageViewDataForCollection,
  selectAllCollectionWithArticles
};
