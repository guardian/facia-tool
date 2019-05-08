import {
  CollectionWithNestedArticles,
  Group,
  Collection,
  ArticleFragment
} from 'shared/types/Collection';
import { selectors as collectionSelectors } from 'shared/bundles/collectionsBundle';
import { selectSharedState } from 'shared/selectors/shared';
import { State } from 'types/State';

import { normalize, denormalize } from './schema';
import { CollectionConfig } from 'types/FaciaApi';
import v4 from 'uuid/v4';
import keyBy from 'lodash/keyBy';

const createGroup = (
  id: string,
  name: string | null,
  articleFragments: string[] = []
): Group => ({
  id,
  name,
  uuid: v4(),
  articleFragments
});

const getUUID = <T extends { uuid: string }>({ uuid }: T) => uuid;

// this is horrible but is the only way to do it!
const groupByIndex = (groups: Group[], index: number): Group | undefined =>
  groups.find(g => parseInt(g.id || '0', 10) === index);

const getAllArticleFragments = (groups: Group[]) =>
  groups.reduce(
    (acc, { articleFragments }) => [...acc, ...articleFragments],
    [] as string[]
  );

const addEmptyGroupsFromCollectionConfigForStage = (
  groupIds: string[],
  entities: { [id: string]: Group },
  collectionConfig: CollectionConfig
) => {
  const groups = groupIds.map(id => entities[id]);
  const addedGroups = collectionConfig.groups
    ? collectionConfig.groups.map((name, i) => {
        const existingGroup = groupByIndex(groups, i);

        return existingGroup
          ? { ...existingGroup, name }
          : createGroup(`${i}`, name);
      })
    : [createGroup('0', null, getAllArticleFragments(groups))];

  return {
    addedGroups: keyBy(addedGroups, getUUID),
    groupIds: addedGroups
      .map(getUUID)
      .slice()
      .reverse()
  };
};

interface ReduceResult {
  live: string[];
  draft: string[];
  previously: string[];
  addedGroups: { [key: string]: Group };
}

const addEmptyGroupsFromCollectionConfig = (
  normalisedCollection: any,
  collectionConfig: CollectionConfig
) =>
  (['live', 'previously', 'draft'] as ['live', 'previously', 'draft']).reduce(
    (acc, key) => {
      const {
        addedGroups,
        groupIds
      } = addEmptyGroupsFromCollectionConfigForStage(
        normalisedCollection.result[key],
        normalisedCollection.entities.groups,
        collectionConfig
      );
      return {
        ...acc,
        addedGroups: {
          ...acc.addedGroups,
          ...addedGroups
        },
        [key]: groupIds
      };
    },
    { live: [], draft: [], previously: [], addedGroups: {} } as ReduceResult
  );

const normaliseCollectionWithNestedArticles = (
  collection: CollectionWithNestedArticles,
  collectionConfig: CollectionConfig
): {
  normalisedCollection: Collection;
  groups: { [key: string]: Group };
  articleFragments: { [key: string]: ArticleFragment };
} => {
  const normalisedCollection = normalize(collection);
  const {
    addedGroups,
    live,
    draft,
    previously
  } = addEmptyGroupsFromCollectionConfig(
    normalisedCollection,
    collectionConfig
  );
  return {
    normalisedCollection: {
      ...normalisedCollection.result,
      live,
      draft,
      previously
    },
    groups: {
      ...(normalisedCollection.entities.groups || {}),
      ...addedGroups
    },
    articleFragments: normalisedCollection.entities.articleFragments || {}
  };
};

function denormaliseCollection(
  state: State,
  id: string
): CollectionWithNestedArticles {
  const collection = collectionSelectors.selectById(
    selectSharedState(state),
    id
  );
  if (!collection) {
    throw new Error(
      `Could not denormalise collection - no collection found with id '${id}'`
    );
  }

  return denormalize(collection, {
    articleFragments: state.shared.articleFragments,
    groups: state.shared.groups
  });
}

export { normaliseCollectionWithNestedArticles, denormaliseCollection };
