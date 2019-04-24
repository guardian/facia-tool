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

const getGroupIndex = (id?: string): number => parseInt(id || '0', 10);

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
  let groupsWithNames = groups.map(group => {
    let name: string | null = null;
    const groupNumberAsInt = getGroupIndex(group.id);
    if (
      collectionConfig.groups &&
      groupNumberAsInt < collectionConfig.groups.length
    ) {
      name = collectionConfig.groups[groupNumberAsInt];
    }
    return { ...group, name };
  });

  // We may have empty groups in the config which would not show up in the normalised
  // groups result. We need to add these into the groups array.
  if (collectionConfig.groups) {
    collectionConfig.groups.forEach((group, index) => {
      if (
        !groupsWithNames.some(addedGroup => {
          if (addedGroup.id) {
            return parseInt(addedGroup.id, 10) === index;
          }
          return index === 0;
        })
      ) {
        groupsWithNames.push(createGroup(`${index}`, group));
      }
    });
  }

  // If we have no article fragments and no groups in a collection we still need to create
  // and empty group for articles.
  if (groupsWithNames.length === 0) {
    groupsWithNames = [createGroup('0', null, getAllArticleFragments(groups))];
  }

  // Finally we need to sort the groups according to their ids.
  groupsWithNames.sort((g1, g2) => {
    const index1 = getGroupIndex(g1.id);
    const index2 = getGroupIndex(g2.id);

    if (index1 > index2) {
      return -1;
    }

    if (index1 < index2) {
      return 1;
    }

    return 0;
  });

  return {
    addedGroups: keyBy(groupsWithNames, getUUID),
    groupIds: groupsWithNames.map(getUUID).slice()
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
    groups: addedGroups,
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
