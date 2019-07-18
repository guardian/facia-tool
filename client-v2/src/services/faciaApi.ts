import isValid from 'date-fns/is_valid';
import {
  FrontsConfig,
  FrontsConfigResponse,
  FrontConfigMap,
  ArticleDetails,
  VisibleArticlesResponse,
  FrontConfig,
  CollectionConfigMap,
  CollectionResponse,
  EditionCollectionResponse
} from 'types/FaciaApi';
import { ExternalArticle } from 'shared/types/ExternalArticle';
import { CollectionWithNestedArticles } from 'shared/types/Collection';
import pandaFetch from './pandaFetch';
import { CapiArticle } from 'types/Capi';
import chunk from 'lodash/chunk';
import { CAPISearchQueryResponse, checkIsResults } from './capiQuery';
import flatMap from 'lodash/flatMap';
import { EditionsIssue, EditionsCollection } from 'types/Edition';
import { EditionsRoutes } from 'routes/routes';

function fetchEditionsIssueAsConfig(issueId: string): Promise<FrontsConfig> {
  return pandaFetch(EditionsRoutes.issuePath(issueId), {
    method: 'get',
    credentials: 'same-origin'
  })
    .then(response => response.json())
    .then((json: EditionsIssue) => {
      const fronts: FrontConfigMap = {};
      const collections: CollectionConfigMap = {};

      json.fronts.forEach(front => {
        fronts[front.id] = {
          ...front,
          collections: front.collections.map(collection => collection.id),
          priority: issueId
        };
        front.collections.forEach(collection => {
          collections[collection.id] = {
            ...collection,
            displayName: collection.displayName,
            type: ''
          };
        });
      });

      return {
        fronts,
        collections
      };
    });
}

function fetchFrontsConfig(): Promise<FrontsConfig> {
  return pandaFetch('/config', {
    method: 'get',
    credentials: 'same-origin'
  })
    .then(response => response.json())
    .then((json: FrontsConfigResponse) => {
      const fronts: FrontConfigMap = {};

      Object.keys(json.fronts).forEach(id => {
        const front: FrontConfig = {
          ...json.fronts[id],
          id,
          priority: json.fronts[id].priority || 'editorial'
        };
        fronts[id] = front;
      });

      const collections: CollectionConfigMap = {};

      Object.keys(json.collections).forEach(id => {
        const collection = {
          ...json.collections[id],
          id
        };
        collections[id] = collection;
      });

      return {
        fronts,
        collections
      };
    });
}

async function fetchLastPressed(frontId: string): Promise<string> {
  // The server does not respond with JSON
  return pandaFetch(`/front/lastmodified/${frontId}`)
    .then(response => response.text())
    .then(date => {
      if (!date || !isValid(new Date(date))) {
        throw new Error(
          `Tried to fetch last pressed time for front with id ${frontId}, but there was an error processing the response, which was ${date}`
        );
      }
      return date;
    })
    .catch(response => {
      throw new Error(
        `Tried to fetch last pressed time for front with id ${frontId}, but the server responded with ${
          response.status
        }: ${response.body}`
      );
    });
}

async function fetchVisibleArticles(
  collectionType: string,
  articles: ArticleDetails[]
): Promise<VisibleArticlesResponse> {
  // The server does not respond with JSON
  try {
    const response = await pandaFetch(`/stories-visible/${collectionType}`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin',
      body: JSON.stringify({ stories: articles })
    });
    return await response.json();
  } catch (response) {
    throw new Error(
      `Tried to fetch visible stories for collection type ${collectionType}, but the server responded with ${
        response.status
      }: ${response.body}`
    );
  }
}

async function discardDraftChangesToCollection(
  collectionId: string
): Promise<CollectionResponse> {
  // The server does not respond with JSON
  try {
    const response = await pandaFetch(`/collection/v2Discard/${collectionId}`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin',
      body: JSON.stringify({ collectionId })
    });
    return await response.json();
  } catch (response) {
    throw new Error(
      `Tried to discard changes to collection with id ${collectionId}, but the server responded with ${
        response.status
      }: ${response.body}`
    );
  }
}
async function publishCollection(collectionId: string): Promise<void> {
  // The server does not respond with JSON
  try {
    await pandaFetch(`/collection/publish/${collectionId}`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin',
      body: JSON.stringify({ collectionId })
    });
  } catch (response) {
    throw new Error(
      `Tried to publish collection with id ${collectionId}, but the server responded with ${
        response.status
      }: ${response.body}`
    );
  }
}

const createUpdateCollection = <T>(path: string, method: string) => (
  id: string
) => async (collection: T): Promise<void> => {
  try {
    const response = await pandaFetch(path, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin',
      body: JSON.stringify({ id, collection })
    });
    return await response.json();
  } catch (response) {
    throw new Error(
      `Tried to update collection with id ${id}, but the server responded with ${
        response.status
      }: ${response.body}`
    );
  }
};

const updateCollection = createUpdateCollection<CollectionWithNestedArticles>(
  '/v2Edits',
  'post'
);
const updateEditionsCollection = (collectionId: string) =>
  createUpdateCollection<EditionsCollection>(
    `/editions-api/collections/${collectionId}`,
    'put'
  )(collectionId);

const saveClipboard = (content: NestedArticleFragment[]) =>
  createSaveClipboard(content, '/clipboard');
const saveEditionsClipboard = (content: NestedArticleFragment[]) =>
  createSaveClipboard(content, '/editionsClipboard');

async function createSaveClipboard(
  clipboardContent: NestedArticleFragment[],
  pathSuffix: string
): Promise<void> {
  // The server does not respond with JSON
  try {
    await pandaFetch(`/userdata${pathSuffix}`, {
      method: 'put',
      credentials: 'same-origin',
      body: JSON.stringify(clipboardContent),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (response) {
    throw new Error(
      `Tried to update a clipboard but the server responded with ${
        response.status
      }: ${response.body}`
    );
  }
}

async function saveOpenFrontIds(frontsByPriority?: {
  [priority: string]: string[];
}): Promise<void> {
  try {
    await pandaFetch(`/userdata/frontIdsByPriority`, {
      method: 'put',
      credentials: 'same-origin',
      body: JSON.stringify(frontsByPriority),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (response) {
    throw new Error(
      `Tried to store the open fronts configuration but the server responded with ${
        response.status
      }: ${response.body}`
    );
  }
}

async function saveFavouriteFrontIds(favouriteFrontsByPriority?: {
  [priority: string]: string[];
}): Promise<void> {
  try {
    await pandaFetch(`/userdata/favouriteFrontIdsByPriority`, {
      method: 'put',
      credentials: 'same-origin',
      body: JSON.stringify(favouriteFrontsByPriority),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (response) {
    throw new Error(
      `Tried to store the favourite fronts configuration but the server responded with ${
        response.status
      }: ${response.body}`
    );
  }
}

async function getCollection(collectionId: {
  id: string;
  lastUpdated?: number;
}): Promise<CollectionResponse> {
  const [collection] = await getCollections([collectionId]);

  if (!collection) {
    throw new Error(`Collection with id ${collectionId} not found`);
  }
  return collection;
}

const createGetCollections = <R>(path: string) => async (
  // fetchCollections
  collections: Array<{ id: string; lastUpdated?: number }>
): Promise<R> => {
  const response = await pandaFetch(path, {
    body: JSON.stringify(collections),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'same-origin'
  });
  return response.json();
};

const getCollections = createGetCollections<CollectionResponse[]>(
  '/collections'
);
const getEditionsCollections = createGetCollections<
  EditionCollectionResponse[]
>('/editions-api/collections');

const DEFAULT_PARAMS = {
  'page-size': 50,
  'show-elements': 'video,main',
  'show-blocks': 'main',
  'show-tags': 'all',
  'show-atoms': 'media',
  'show-fields':
    'internalPageCode,isLive,firstPublicationDate,scheduledPublicationDate,headline,trailText,byline,thumbnail,secureThumbnail,liveBloggingNow,membershipAccess,shortUrl'
};

/**
 * Get a CAPI query string for the given content ids. This could be a single article
 * or tag/section, or a list of articles.
 */
const getCapiUriForContentIds = (contentIds: string[]) => {
  const contentIdsStr = contentIds.join(',');
  const searchStr =
    contentIds.length > 1
      ? `search?ids=${contentIdsStr}&`
      : `${contentIdsStr}?`;
  return `/api/preview/${searchStr}${Object.entries(DEFAULT_PARAMS)
    .map(e => e.join('='))
    .join('&')}`;
};

const getTagOrSectionTitle = (queryResponse: CAPISearchQueryResponse) => {
  const { response } = queryResponse;

  return response
    ? (response.tag && response.tag.webTitle) ||
        (response.section && response.section.webTitle)
    : undefined;
};

const getExternalArticleId = (article: CapiArticle) =>
  `internal-code/page/${article.fields.internalPageCode}`;

const transformExternalArticle = (article: CapiArticle) => ({
  ...article,
  urlPath: article.id,
  id: getExternalArticleId(article)
});

const parseArticleListFromResponses = (
  queryResponseUnionType: CAPISearchQueryResponse
): ExternalArticle[] => {
  const { response } = queryResponseUnionType;
  try {
    if (response.status === 'error') {
      throw new Error(response.message || 'Unknown error from CAPI');
    }
    // We may be dealing with a single result, or an array of results -
    // CAPI formats each query differently.
    const results: CapiArticle[] = checkIsResults(response)
      ? response.results
      : [response.content];

    return results.map(transformExternalArticle);
  } catch (e) {
    throw new Error(
      `Error getting articles from CAPI: cannot parse response - ${e.message}`
    );
  }
};

/**
 * Get the articles and title for a CAPI content id, which could be a tag or an article.
 */
async function getContent(
  contentId: string
): Promise<{
  articles: ExternalArticle[];
  title: string | undefined;
}> {
  const response = await pandaFetch(getCapiUriForContentIds([contentId]), {
    method: 'get',
    credentials: 'same-origin'
  });
  const parsedResponse: CAPISearchQueryResponse = await response.json();
  return {
    articles: parseArticleListFromResponses(parsedResponse),
    title: getTagOrSectionTitle(parsedResponse)
  };
}

/**
 * Get articles for an array of article ids. If the number of articles exceed the limit
 * CAPI can process in one request, issue multiple requests, returning a concatenated
 * list of articles when all of them complete.
 */
async function getArticlesBatched(
  articleIds: string[]
): Promise<ExternalArticle[]> {
  const capiPromises = chunk(articleIds, 50).map(localArticleIDs => {
    return pandaFetch(getCapiUriForContentIds(localArticleIDs), {
      method: 'get',
      credentials: 'same-origin'
    });
  });

  try {
    const responses = await Promise.all(capiPromises);
    const parsedResponses: CAPISearchQueryResponse[] = await Promise.all(
      responses.map(_ => _.json())
    );
    return flatMap(parsedResponses.map(parseArticleListFromResponses));
  } catch (e) {
    throw new Error(`Error fetching articles: ${e.message || e.status}`);
  }
}

export {
  fetchFrontsConfig,
  fetchEditionsIssueAsConfig,
  getCollections,
  getEditionsCollections,
  getCollection,
  getContent,
  getTagOrSectionTitle,
  getArticlesBatched,
  fetchLastPressed,
  publishCollection,
  updateCollection,
  updateEditionsCollection,
  saveClipboard,
  saveEditionsClipboard,
  saveOpenFrontIds,
  saveFavouriteFrontIds,
  getCapiUriForContentIds,
  fetchVisibleArticles,
  discardDraftChangesToCollection,
  transformExternalArticle,
  DEFAULT_PARAMS
};
