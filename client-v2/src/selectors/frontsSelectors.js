// @flow

import { createSelector } from 'reselect';
import { breakingNewsFrontId } from '../constants/fronts';

import type {
  FrontsClientConfig,
  Front,
  ConfigCollection,
  FrontDetailFull,
  FrontsWithIds,
  FrontsByPriority
} from '../types/FrontsConfig';

import type { State } from '../types/State';

const rawFrontsSelector = (state: State): Front => state.frontsConfig.fronts;

const getFronts = createSelector(
  [rawFrontsSelector],
  (fronts: Front): FrontsWithIds =>
    Object.keys(fronts)
      .map((id): FrontDetailFull => ({
        id,
        ...fronts[id],
        priority: fronts[id].priority || 'editorial'
      }))
      .reduce(
        (acc: FrontsWithIds, front: FrontDetailFull): FrontsWithIds => ({
          ...acc,
          [front.id]: front
        }),
        {}
      )
);

const getFrontsByPriority = createSelector(
  [getFronts],
  (fronts: FrontsWithIds): FrontsByPriority =>
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

const getFrontsWithPriority = (
  state: State,
  priority: string
): FrontDetailFull[] =>
  keyedObjToArray(getFrontsByPriority(state)[priority] || {});

const collectionsSelector = (state: State): ConfigCollection =>
  state.frontsConfig.collections;

const frontsIdSelector = createSelector([rawFrontsSelector], fronts => {
  if (!fronts) {
    return [];
  }
  return Object.keys(fronts)
    .filter(front => front !== breakingNewsFrontId)
    .sort();
});

const getFrontsConfig = (
  state: State,
  priority: string
): FrontsClientConfig => ({
  fronts: getFrontsWithPriority(state, priority),
  collections: collectionsSelector(state)
});

export { getFrontsConfig, frontsIdSelector, getFrontsWithPriority };
