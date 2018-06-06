// @flow
import uniq from 'lodash/uniq';
import { createSelector } from 'reselect';
import type { FrontConfig, CollectionConfig } from 'types/FaciaApi';
import type { State } from 'types/State';
import type { AlsoOnDetail } from 'types/Collection';
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

const getFronts = (state: State): FrontConfigMap =>
  state.frontsConfig.fronts || {};

const getFront = (state: State, id: string) => getFronts(state)[id];

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

const prioritySelector = (state: State, { priority }: { priority: string }) =>
  priority;

const frontIdSelector = (state: State, { frontId }) => frontId;

const frontsAsArraySelector = createSelector([getFronts], fronts => {
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

const getFrontsWithPriority = (state: State, priority: string): FrontConfig[] =>
  getFrontsByPriority(state)[priority] || [];

const getCollections = (state: State): CollectionConfigMap =>
  state.frontsConfig.collections || {};
const getCollectionConfig = (state: State, id: string): CollectionConfig =>
  getCollections(state)[id] || null;

const frontsIdsSelector = createSelector([getFronts], (fronts): string[] => {
  if (!fronts) {
    return [];
  }
  return Object.keys(fronts)
    .filter(frontId => frontId !== breakingNewsFrontId)
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
  [frontIdSelector, frontsAsArraySelector, getCollections],
  getCollectionConfigs
);

const frontsConfigSelector = createSelector(
  [getFronts, getCollections, frontsIdsSelector, prioritySelector],
  getFrontsConfig
);

const alsoOnFrontSelector = (
  currentFront: ?FrontConfig,
  fronts: Array<FrontConfig>
): { [string]: AlsoOnDetail } => {
  if (!currentFront) {
    return {};
  }
  const currentFrontId = currentFront.id;
  const currentFrontPriority = currentFront.priority;
  const currentFrontCollections = currentFront.collections;
  return currentFrontCollections.reduce(
    (allCollectionAlsoOn, currentFrontCollectionId) => {
      const collectionAlsoOn = fronts.reduce(
        (collectionAlsoOnSoFar, front) => {
          const duplicatesOnFront = front.collections.reduce(
            (soFar, collectionId) => {
              if (
                front.id !== currentFrontId &&
                collectionId === currentFrontCollectionId
              ) {
                const meritsWarning =
                  currentFrontPriority !== 'commercial' &&
                  front.priority === 'commercial';

                return {
                  priorities: soFar.priorities.concat([front.priority]),
                  meritsWarning: soFar.meritsWarning || meritsWarning,
                  fronts: soFar.fronts.concat([
                    { id: front.id, priority: front.priority }
                  ])
                };
              }
              return soFar;
            },
            { priorities: [], meritsWarning: false, fronts: [] }
          );

          return {
            priorities: uniq(
              collectionAlsoOnSoFar.priorities.concat(
                duplicatesOnFront.priorities
              )
            ),
            meritsWarning:
              collectionAlsoOnSoFar.meritsWarning ||
              duplicatesOnFront.meritsWarning,
            fronts: collectionAlsoOnSoFar.fronts.concat(
              duplicatesOnFront.fronts
            )
          };
        },
        { priorities: [], fronts: [], meritsWarning: false }
      );

      return {
        ...allCollectionAlsoOn,
        [currentFrontCollectionId]: collectionAlsoOn
      };
    },
    {}
  );
};

const createAlsoOnSelector = () =>
  createSelector([getFront, frontsAsArraySelector], alsoOnFrontSelector);

export {
  getFront,
  getFrontsConfig,
  getCollectionConfig,
  frontsConfigSelector,
  collectionConfigsSelector,
  frontsIdsSelector,
  getFrontsWithPriority,
  alsoOnFrontSelector,
  createAlsoOnSelector
};
