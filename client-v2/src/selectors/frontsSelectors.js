// @flow

import { createSelector } from 'reselect';

import type {
  FrontConfig,
  FrontDetail,
  FrontsClientConfig
} from '../types/Fronts';

import type { State } from '../types/State';

const getFrontsConfig = (
  state: State,
  priority: string
): FrontsClientConfig => {
  const { frontsConfig } = state;
  if (Object.keys(frontsConfig).length === 0) {
    return { fronts: [], collections: [] };
  }
  const frontIds: Array<string> = Object.keys(frontsConfig.fronts);
  const fronts = frontIds.reduce((acc: Array<FrontDetail>, key: string) => {
    if (
      frontsConfig.fronts[key].priority === priority ||
      (!frontsConfig.fronts[key].priority && priority === 'editorial')
    ) {
      const frontConfig: FrontConfig = frontsConfig.fronts[key];
      const frontDetail: FrontDetail = Object.assign({}, frontConfig, {
        id: key
      });
      acc.push(frontDetail);
    }
    return acc;
  }, []);
  const collections = [];
  return { fronts, collections };
};

const GetFrontsConfigStateSelector = createSelector(
  [getFrontsConfig],
  frontsConfig => frontsConfig
);

export { getFrontsConfig, GetFrontsConfigStateSelector };
