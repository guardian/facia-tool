import { initialState as externalArticlesState } from 'shared/bundles/externalArticlesBundle';
import { initialState as collectionsState } from 'shared/bundles/collectionsBundle';

const stateWithClipboard = {
  clipboard: {
    frontsClipboard: ['article', 'article2'],
    editionsClipboard: ['article3']
  },
  shared: {
    groups: {},
    externalArticles: externalArticlesState,
    collections: collectionsState,
    articleFragments: {
      article: {
        id: 'article/live/0',
        frontPublicationDate: 1,
        publishedBy: 'Computers',
        meta: {},
        uuid: 'article'
      },
      article2: {
        id: 'article/live/1',
        frontPublicationDate: 1,
        publishedBy: 'Computers',
        meta: { supporting: ['article3'] },
        uuid: 'article2'
      },
      article3: {
        id: 'article/live/3',
        frontPublicationDate: 1,
        publishedBy: 'Computers',
        meta: {},
        uuid: 'article3'
      }
    }
  }
};

export { stateWithClipboard };
