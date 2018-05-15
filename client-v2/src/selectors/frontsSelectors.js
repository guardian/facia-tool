// @flow

import { createSelector } from 'reselect';
import type { FrontConfig, CollectionConfig } from 'services/faciaApi';
import type { State } from 'types/State';
import { breakingNewsFrontId } from 'constants/fronts';

type FrontConfigMap = {
  [string]: FrontConfig
};

type CollectionConfigMap = {
  [string]: CollectionConfig
};

const frontsSelector = (state: State): FrontConfigMap =>
  state.frontsConfig.fronts;
const collectionsSelector = (state: State): CollectionConfigMap =>
  state.frontsConfig.collections;

const prioritySelector = (state: State, { priority }: { priority: string }) =>
  priority;

const frontIdSelector = (state: State, { frontId }) => frontId;

const frontsAsArraySelector = createSelector([frontsSelector], fronts => {
  if (!fronts) {
    return [];
  }
  return Object.keys(fronts).reduce((frontsAsArray, frontId) => {
    const front = fronts[frontId];
    const withId = Object.assign({}, front, { id: frontId });
    frontsAsArray.push(withId);
    return frontsAsArray;
  }, []);
});

const frontsIdsSelector = createSelector([frontsSelector], fronts => {
  if (!fronts) {
    return [];
  }
  return Object.keys(fronts)
    .filter(front => front !== breakingNewsFrontId)
    .sort();
});

const getFrontsConfig = (
  fronts: FrontConfigMap,
  collections: CollectionConfigMap,
  frontIds: Array<string>,
  priority: string
): {
  fronts: FrontConfig[],
  collections: CollectionConfigMap
} => {
  if (frontIds.length === 0) {
    return { fronts: [], collections: {} };
  }
  const frontsWithPriority = frontIds.reduce(
    (acc: Array<FrontConfig>, key: string) => {
      if (
        fronts[key].priority === priority ||
        (!fronts[key].priority && priority === 'editorial')
      ) {
        return [...acc, fronts[key]];
      }
      return acc;
    },
    []
  );
  return {
    fronts: frontsWithPriority,
    collections
  };
};

const getCollectionConfigs = (
  frontId: ?string,
  fronts: Array<FrontConfig>,
  collections: CollectionConfigMap
): Array<CollectionConfig> => {
  if (!frontId) {
    return [];
  }

  const selectedFront = fronts.find(front => front.id === frontId);

  if (selectedFront) {
    return selectedFront.collections.map(collectionId =>
      Object.assign({}, collections[collectionId], { id: collectionId })
    );
  }

  return [];
};

const collectionConfigsSelector = createSelector(
  [frontIdSelector, frontsAsArraySelector, collectionsSelector],
  getCollectionConfigs
);

const frontsConfigSelector = createSelector(
  [frontsSelector, collectionsSelector, frontsIdsSelector, prioritySelector],
  getFrontsConfig
);

export {
  getFrontsConfig,
  frontsConfigSelector,
  collectionConfigsSelector,
  frontsIdsSelector
};
