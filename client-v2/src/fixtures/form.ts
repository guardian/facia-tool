import {
  stateWithCollection,
  capiArticle,
  capiArticleWithVideo
} from 'shared/fixtures/shared';

const state = {
  ...stateWithCollection,
  shared: {
    ...stateWithCollection.shared,
    externalArticles: {
      data: {
        'article/live/0': capiArticle
      }
    }
  }
};

const stateWithVideoArticle = {
  ...stateWithCollection,
  shared: {
    ...stateWithCollection.shared,
    externalArticles: {
      data: {
        'article/live/0': capiArticleWithVideo
      }
    }
  }
};

export { state, stateWithVideoArticle };
