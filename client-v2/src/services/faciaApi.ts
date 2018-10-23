import isValid from 'date-fns/is_valid';
import {
  FrontsConfig,
  FrontsConfigResponse,
  FrontConfigMap
} from 'types/FaciaApi';
import { ExternalArticle } from 'shared/types/ExternalArticle';
import {
  CollectionResponse,
  CollectionWithNestedArticles,
  NestedArticleFragment
} from 'shared/types/Collection';
import pandaFetch from './pandaFetch';
import { CapiArticle } from 'types/Capi';
import chunk from 'lodash/chunk';
import flatMap from 'lodash/flatMap';

function fetchFrontsConfig(): Promise<FrontsConfig> {
  return pandaFetch('/config', {
    method: 'get',
    credentials: 'same-origin'
  })
    .then(response => response.json())
    .then((json: FrontsConfigResponse) => ({
      fronts: Object.keys(json.fronts).reduce(
        (acc: FrontConfigMap, id: string): FrontConfigMap => ({
          ...acc,
          [id]: {
            ...json.fronts[id],
            id,
            priority: json.fronts[id].priority || 'editorial'
          }
        }),
        {}
      ),
      collections: Object.keys(json.collections).reduce((acc, id) => {
        const collection = json.collections[id];
        const groups = collection.groups && collection.groups.slice().reverse();
        return {
          ...acc,
          [id]: {
            ...collection,
            groups,
            id
          }
        };
      }, {})
    }));
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

async function updateCollection(
  id: string,
  collection: CollectionWithNestedArticles
): Promise<CollectionWithNestedArticles> {
  try {
    const response = await pandaFetch(`/v2Edits`, {
      method: 'post',
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
}

async function saveClipboard(
  clipboardContent: NestedArticleFragment[]
): Promise<NestedArticleFragment[]> {
  // The server does not respond with JSON
  try {
    const response = await pandaFetch(`/userdata/clipboard`, {
      method: 'put',
      credentials: 'same-origin',
      body: JSON.stringify(clipboardContent),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return await response.json();
  } catch (response) {
    throw new Error(
      `Tried to update a clipboard but the server responded with ${
        response.status
      }: ${response.body}`
    );
  }
}

async function saveOpenFrontIds(frontIds?: string[]): Promise<void> {
  try {
    await pandaFetch(`/userdata/frontIds`, {
      method: 'put',
      credentials: 'same-origin',
      body: JSON.stringify(frontIds),
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

function getCollection(
  collectionId: string
): Promise<CollectionWithNestedArticles> {
  return pandaFetch(`/collection/${collectionId}`, {
    method: 'get',
    credentials: 'same-origin'
  })
    .then(response => response.json())
    .then((json: CollectionResponse) => ({
      ...json,
      id: collectionId
    }));
}

const getCapiUriForArticleIds = (articleIds: string[]) => {
  const joinedArticleIds = articleIds.join(',');
  return `/api/preview/search?ids=${joinedArticleIds}&show-elements=video,main&show-blocks=main&show-tags=all&show-atoms=media&show-fields=internalPageCode,isLive,firstPublicationDate,scheduledPublicationDate,headline,trailText,byline,thumbnail,secureThumbnail,liveBloggingNow,membershipAccess,shortUrl`;
};

function getArticles(articleIds: string[]): Promise<ExternalArticle[]> {
  const parseArticleListFromResponse = (
    text: string | void
  ): ExternalArticle[] => {
    if (text) {
      return JSON.parse(text).response.results.map(
        (externalArticle: CapiArticle) => ({
          ...externalArticle,
          urlPath: externalArticle.id,
          id: `internal-code/page/${externalArticle.fields.internalPageCode}`
        })
      );
    }
    throw new Error('Error getting articles from CAPI - invalid response');
  };

  const articleIdsWithoutSnaps = articleIds.filter(id => !id.match(/^snap/));

  if (!articleIdsWithoutSnaps.length) {
    return Promise.resolve([]);
  }

  const articlePromises = chunk(articleIdsWithoutSnaps, 50).map(
    localArticleIds =>
      pandaFetch(getCapiUriForArticleIds(localArticleIds), {
        method: 'get',
        credentials: 'same-origin'
      })
  );

  return Promise.all(articlePromises)
    .then(responses => Promise.all(responses.map(response => response.text())))
    .then(articleJSONArray =>
      Promise.resolve([
        ...flatMap(
          articleJSONArray.map(articleJSON =>
            parseArticleListFromResponse(articleJSON)
          )
        )
      ])
    )
    .catch(response => {
      throw new Error(
        `Error fetching articles - the server returned ${response.status}: ${
          response.statusText
        }`
      );
    });
}

export {
  fetchFrontsConfig,
  getCollection,
  getArticles,
  fetchLastPressed,
  publishCollection,
  updateCollection,
  saveClipboard,
  saveOpenFrontIds,
  getCapiUriForArticleIds
};
