<<<<<<< HEAD
import { frontsConfig } from 'fixtures/frontsConfig';
import {
  stateWithCollection,
  capiArticle,
  capiArticleWithVideo
} from 'shared/fixtures/shared';
=======
import { stateWithCollection, capiArticle, capiArticleWithVideo } from 'shared/fixtures/shared';
>>>>>>> Bang, and the unused stuff is gone

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
