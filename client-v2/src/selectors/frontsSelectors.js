// @flow

import { createSelector } from 'reselect';

import type {
  FrontConfig,
  FrontDetail,
  FrontsClientConfig,
  Front
} from '../types/Fronts';

import type { State } from '../types/State';

const frontsSelector = (state: State): Front => state.frontsConfig.fronts;

const prioritySelector = (_, priority: string) => priority;

const frontsIdSelector = createSelector([frontsSelector], fronts => {
  if (!fronts) {
    return [];
  }
  return Object.keys(fronts);
});

const getFrontsConfig = (
  fronts: Front,
  frontIds: Array<string>,
  priority: string
): FrontsClientConfig => {
  if (frontIds.length === 0) {
    return { fronts: [], collections: [] };
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
  const collections = [];
  return {
    fronts: frontsWithPriority,
    collections
  };
};

const GetFrontsConfigStateSelector = createSelector(
  [frontsSelector, frontsIdSelector, prioritySelector],
  getFrontsConfig
);

export { getFrontsConfig, GetFrontsConfigStateSelector };
