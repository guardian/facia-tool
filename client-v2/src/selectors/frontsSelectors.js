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

const prioritySelector = (state: State, priority: string) => priority;

const frontsIdSelector = createSelector([frontsSelector], fronts => {
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

const GetFrontsConfigStateSelector = createSelector(
  [frontsSelector, collectionsSelector, frontsIdSelector, prioritySelector],
  getFrontsConfig
);

export { getFrontsConfig, GetFrontsConfigStateSelector, frontsIdSelector };
