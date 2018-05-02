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

type FrontsByPriority = {
  [string]: FrontConfigMap
};

const getFronts = (state: State): FrontConfigMap => state.frontsConfig.fronts;

const getFrontsByPriority = createSelector(
  [getFronts],
  (fronts: FrontConfigMap): FrontsByPriority =>
    Object.keys(fronts).reduce(
      (acc: FrontsByPriority, id): FrontsByPriority => {
        const front = fronts[id];
        return {
          ...acc,
          [front.priority]: {
            ...acc[front.priority],
            [id]: fronts[id]
          }
        };
      },
      {}
    )
);

const keyedObjToArray = <T>(obj: { [string]: T }): Array<T> =>
  Object.keys(obj).map((key): T => obj[key]);

const getFrontsWithPriority = (state: State, priority: string): FrontConfig[] =>
  keyedObjToArray(getFrontsByPriority(state)[priority] || {});

const getCollections = (state: State): CollectionConfigMap =>
  state.frontsConfig.collections;

const frontsIdSelector = createSelector([getFronts], fronts => {
  if (!fronts) {
    return [];
  }
  return Object.keys(fronts)
    .filter(front => front !== breakingNewsFrontId)
    .sort();
});

export { frontsIdSelector, getFrontsWithPriority, getCollections };
