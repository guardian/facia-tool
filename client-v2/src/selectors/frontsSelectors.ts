import uniq from 'lodash/uniq';
import { createSelector } from 'reselect';
import { FrontConfig, CollectionConfig } from 'types/FaciaApi';
import { State } from 'types/State';
import { AlsoOnDetail } from 'types/Collection';
import { breakingNewsFrontId } from 'constants/fronts';
import { selectors as frontsConfigSelectors } from 'bundles/frontsConfigBundle';

import { CollectionItemSets, Stages } from 'shared/types/Collection';

interface FrontConfigMap {
  [id: string]: FrontConfig;
}

interface CollectionConfigMap {
  [id: string]: CollectionConfig;
}

interface FrontsByPriority {
  [id: string]: FrontConfig[];
}

const getFronts = (state: State): FrontConfigMap =>
  frontsConfigSelectors.selectAll(state).fronts || {};

const getFront = (state: State, id: string) => getFronts(state)[id];

const getFrontsByPriority = createSelector(
  [getFronts],
  (fronts: FrontConfigMap): FrontsByPriority =>
    Object.keys(fronts)
      .sort()
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

const frontIdSelector = (state: State, { frontId }: { frontId: string }) =>
  frontId;

const collectionSetSelector = (
  state: State,
  { collectionSet }: { collectionSet: CollectionItemSets }
) => collectionSet;

const collectionIdAndStageSelector = (
  state: State,
  { stage, collectionId }: { stage: Stages; collectionId: string }
) => ({
  stage,
  collectionId
});

const collectionVisibilitiesSelector = (state: State) =>
  state.fronts.collectionVisibility;

const collectionIdSelector = (
  state: State,
  { collectionId }: { collectionId: string }
) => collectionId;

const unpublishedChangesSelector = (state: State) => state.unpublishedChanges;

const frontsAsArraySelector = createSelector(
  [getFronts],
  fronts => {
    if (!fronts) {
      return [];
    }
    return Object.keys(fronts).reduce(
      (frontsAsArray, frontId) => {
        const front = fronts[frontId];
        const withId = Object.assign({}, front, { id: frontId });
        frontsAsArray.push(withId);
        return frontsAsArray;
      },
      [] as FrontConfig[]
    );
  }
);

const getFrontsWithPriority = (state: State, priority: string): FrontConfig[] =>
  getFrontsByPriority(state)[priority] || [];

const getCollections = (state: State): CollectionConfigMap =>
  frontsConfigSelectors.selectAll(state).collections || {};

const getCollectionConfig = (state: State, id: string): CollectionConfig =>
  getCollections(state)[id] || null;

const frontsIdsSelector = createSelector(
  [getFronts],
  (fronts): string[] => {
    if (!fronts) {
      return [];
    }
    return Object.keys(fronts)
      .filter(frontId => frontId !== breakingNewsFrontId)
      .sort();
  }
);

const getFrontsConfig = (
  fronts: FrontConfigMap,
  collections: CollectionConfigMap,
  frontIds: string[],
  priority: string
): {
  fronts: FrontConfig[];
  collections: CollectionConfigMap;
} => {
  if (frontIds.length === 0) {
    return { fronts: [], collections: {} };
  }
  const frontsWithPriority = frontIds.reduce(
    (acc: FrontConfig[], key: string) => {
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
  frontId: string | void,
  fronts: FrontConfig[],
  collections: CollectionConfigMap
): CollectionConfig[] => {
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

const getUnpublishedChangesStatus = (
  collectionId: string,
  unpublishedChanges: { [id: string]: boolean }
): boolean => (unpublishedChanges ? unpublishedChanges[collectionId] : false);

const collectionConfigsSelector = createSelector(
  [frontIdSelector, frontsAsArraySelector, getCollections],
  getCollectionConfigs
);

const frontsConfigSelector = createSelector(
  [getFronts, getCollections, frontsIdsSelector, prioritySelector],
  getFrontsConfig
);

const hasUnpublishedChangesSelector = createSelector(
  [collectionIdSelector, unpublishedChangesSelector],
  getUnpublishedChangesStatus
);

const alsoOnFrontSelector = (
  currentFront: FrontConfig | void,
  fronts: FrontConfig[]
): { [id: string]: AlsoOnDetail } => {
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
            {
              priorities: [] as string[],
              meritsWarning: false,
              fronts: [] as Array<{ id: string; priority: string }>
            }
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
        {
          priorities: [] as string[],
          fronts: [] as Array<{ id: string; priority: string }>,
          meritsWarning: false
        }
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
  createSelector(
    [getFront, frontsAsArraySelector],
    alsoOnFrontSelector
  );

const lastPressedSelector = (state: State, frontId: string): string | null =>
  state.fronts.lastPressed[frontId] || null;

const clipboardSelector = (state: State) => state.clipboard;

const visibleArticlesSelector = createSelector(
  [collectionVisibilitiesSelector, collectionIdAndStageSelector],
  (collectionVisibilities, { collectionId, stage }) => {
    return collectionVisibilities[stage][collectionId];
  }
);

const visibleFrontArticlesSelector = createSelector(
  [collectionVisibilitiesSelector, collectionSetSelector],
  (collectionVisibilities, collectionSet) => {
    if (collectionSet === 'previously') {
      return {};
    }
    return collectionVisibilities[collectionSet];
  }
);

export {
  getFront,
  getFrontsConfig,
  getCollectionConfig,
  frontsConfigSelector,
  collectionConfigsSelector,
  frontsIdsSelector,
  getFrontsWithPriority,
  alsoOnFrontSelector,
  createAlsoOnSelector,
  lastPressedSelector,
  hasUnpublishedChangesSelector,
  clipboardSelector,
  visibleArticlesSelector,
  visibleFrontArticlesSelector
};
