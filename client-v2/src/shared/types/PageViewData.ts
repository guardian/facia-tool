interface PageViewDataFromOphan {
  totalHits: number;
  series: PageViewDataSeriesData[];
  path: string;
}

interface PageViewDataSeriesData {
  name: string;
  data: PageViewDataSeriesDataPoint[];
}

interface PageViewDataSeriesDataPoint {
  dateTime: number;
  count: number;
}

interface PageViewStory {
  articleId: string;
  articlePath: string;
  totalHits: number;
  data?: PageViewDataSeriesDataPoint[];
}

interface PageViewDataPerFront {
  frontId: string;
  collections: PageViewDataPerCollection[];
}

interface PageViewDataPerCollection {
  collectionId: string;
  stories: PageViewStory[];
}

interface PageViewArticlesOnFront {
  frontId: string;
  stories: PageViewStory[];
}

// models for request

interface ArticlePathAndId {
  articlePath: string;
  articleId: string;
}

interface CollectionWithArticles {
  id: string;
  articles: ArticlePathAndId[];
}

export {
  PageViewDataFromOphan,
  PageViewDataSeriesData,
  PageViewDataSeriesDataPoint,
  PageViewDataPerFront,
  PageViewDataPerCollection,
  PageViewStory,
  ArticlePathAndId,
  CollectionWithArticles,
  PageViewArticlesOnFront
};
