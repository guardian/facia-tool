// @flow

import { createSelector } from 'reselect';

import type {
  FrontConfig,
  FrontDetail,
  FrontsClientConfig,
  Front,
  ConfigCollection
} from 'Types/FrontsConfig';

import type { State } from 'Types/State';
import { breakingNewsFrontId } from 'Constants/fronts';

const frontsSelector = (state: State): Front => state.frontsConfig.fronts;
const collectionsSelector = (state: State): ConfigCollection =>
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
  fronts: Front,
  collections: ConfigCollection,
  frontIds: Array<string>,
  priority: string
): FrontsClientConfig => {
  if (frontIds.length === 0) {
    return { fronts: [], collections: {} };
  }
  const frontsWithPriority = frontIds.reduce(
    (acc: Array<FrontDetail>, key: string) => {
      if (
        fronts[key].priority === priority ||
        (!fronts[key].priority && priority === 'editorial')
      ) {
        const frontConfig: FrontConfig = fronts[key];
        const frontDetail: FrontDetail = Object.assign({}, frontConfig, {
          id: key
        });
        acc.push(frontDetail);
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
