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
  [string]: FrontConfig[]
};

const getFronts = (state: State): FrontConfigMap => state.frontsConfig.fronts;

const getFrontsByPriority = createSelector(
  [getFronts],
  (fronts: FrontConfigMap): FrontsByPriority =>
    Object.keys(fronts)
      .filter(id => id !== breakingNewsFrontId)
      .reduce((acc: FrontsByPriority, id): FrontsByPriority => {
        const front = fronts[id];
        return {
          ...acc,
          [front.priority]: [...(acc[front.priority] || []), fronts[id]]
        };
      }, {})
);

const getFrontsWithPriority = (state: State, priority: string): FrontConfig[] =>
  getFrontsByPriority(state)[priority] || [];

const getCollections = (state: State): CollectionConfigMap =>
  state.frontsConfig.collections || {};

const frontsIdSelector = createSelector([getFronts], (fronts): string[] => {
  if (!fronts) {
    return [];
  }
  return Object.keys(fronts)
    .filter(frontId => frontId !== breakingNewsFrontId)
    .sort();
});

export { frontsIdSelector, getFrontsWithPriority, getCollections };
