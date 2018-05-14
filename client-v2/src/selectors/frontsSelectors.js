// @flow

import { createSelector } from 'reselect';
import { breakingNewsFrontId } from '../constants/fronts';

import type {
  FrontConfig,
  FrontDetail,
  FrontsClientConfig,
  Front,
  ConfigCollection,
  ConfigCollectionDetailWithId
} from '../types/FrontsConfig';

import type { State } from '../types/State';

const frontsSelector = (state: State): Front => state.frontsConfig.fronts;
const collectionsSelector = (state: State): ConfigCollection =>
  state.frontsConfig.collections;

const prioritySelector = (state: State, { priority }) => priority;

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

const getCollectionConfigs = (
  frontId: ?string,
  fronts: Array<any>,
  collections: ConfigCollection
): Array<ConfigCollectionDetailWithId> => {
  if (!frontId) {
    return [];
  }

  const selectedFront: ?FrontDetail = fronts.find(
    (front: FrontDetail) => front.id === frontId
  );

  if (selectedFront) {
    return selectedFront.collections.map(collectionId =>
      Object.assign({}, collections[collectionId], { id: collectionId })
    );
  }

  return [];
}


const collectionConfigsSelector = createSelector(
  [frontIdSelector, frontsAsArraySelector, collectionsSelector],
  getCollectionConfigs
);

const frontsConfigSelector = createSelector(
  [frontsSelector, collectionsSelector, frontsIdsSelector, prioritySelector],
  getFrontsConfig
);

export { getFrontsConfig, frontsConfigSelector, collectionConfigsSelector, frontsIdsSelector };
