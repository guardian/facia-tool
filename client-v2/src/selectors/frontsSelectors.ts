import uniq from 'lodash/uniq';
import { createSelector } from 'reselect';
import { FrontConfig, CollectionConfig } from 'types/FaciaApi';
import { State } from 'types/State';
import { AlsoOnDetail } from 'types/Collection';
import { breakingNewsFrontId } from 'constants/fronts';
import { selectors as frontsConfigSelectors } from 'bundles/frontsConfigBundle';

import { CollectionItemSets, Stages } from 'shared/types/Collection';
import {
  createSelectArticlesInCollection,
  selectSharedState
} from 'shared/selectors/shared';
import { createShallowEqualResultSelector } from 'shared/util/selectorUtils';

interface FrontConfigMap {
  [id: string]: FrontConfig;
}

interface CollectionConfigMap {
  [id: string]: CollectionConfig;
}

interface FrontsByPriority {
  [id: string]: FrontConfig[];
}

const selectFronts = (state: State): FrontConfigMap =>
  frontsConfigSelectors.selectAll(state).fronts || {};

const selectFrontId = (state: State, { frontId }: { frontId: string }) =>
  frontId;

const selectFront = createSelector(
  selectFronts,
  selectFrontId,
  (fronts, id) => fronts[id]
);

const selectUnlockedFrontCollections = (
  state: State,
  frontId: string
): string[] =>
  selectFront(state, { frontId }).collections.reduce(
    (unlockedCollections: string[], collectionId) => {
      const collection = selectCollectionConfig(state, collectionId);
      if (!collection.uneditable) {
        unlockedCollections.push(collectionId);
      }
      return unlockedCollections;
    },
    []
  );

const getFrontsByPriority = createSelector(
  [selectFronts],
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

const selectPriority = (state: State, { priority }: { priority: string }) =>
  priority;

const selectCollectionSet = (
  state: State,
  { collectionSet }: { collectionSet: CollectionItemSets }
) => collectionSet;

const selectCollectionIdAndStage = (
  state: State,
  { stage, collectionId }: { stage: Stages; collectionId: string }
) => ({
  stage,
  collectionId
});

const selectCollectionVisibilities = (state: State) =>
  state.fronts.collectionVisibility;

const selectCollectionId = (
  state: State,
  { collectionId }: { collectionId: string }
) => collectionId;

const selectUnpublishedChanges = (state: State) => state.unpublishedChanges;

const selectFrontsAsArray = createSelector(
  [selectFronts],
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

const defaultFrontsWithPriority = [] as [];

const selectFrontsWithPriority = (
  state: State,
  priority: string
): FrontConfig[] =>
  getFrontsByPriority(state)[priority] || defaultFrontsWithPriority;

const getCollections = (state: State): CollectionConfigMap =>
  frontsConfigSelectors.selectAll(state).collections || {};

const selectCollectionConfig = (state: State, id: string): CollectionConfig =>
  getCollections(state)[id] || null;

const selectFrontsIds = createSelector(
  [selectFronts],
  (fronts): string[] => {
    if (!fronts) {
      return [];
    }
    return Object.keys(fronts)
      .filter(frontId => frontId !== breakingNewsFrontId)
      .sort();
  }
);

const deriveFrontsFromIdsAndPriority = (
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

const selectCollectionConfigs = createSelector(
  [selectFrontId, selectFrontsAsArray, getCollections],
  getCollectionConfigs
);

const selectFrontsConfig = createSelector(
  [selectFronts, getCollections, selectFrontsIds, selectPriority],
  deriveFrontsFromIdsAndPriority
);

const selectHasUnpublishedChanges = createSelector(
  [selectCollectionId, selectUnpublishedChanges],
  getUnpublishedChangesStatus
);

const selectAlsoOnFront = (
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

const createSelectAlsoOnFronts = () =>
  createSelector(
    [selectFront, selectFrontsAsArray],
    selectAlsoOnFront
  );

const selectClipboard = (state: State) => state.clipboard;

const selectVisibleArticles = createSelector(
  [selectCollectionVisibilities, selectCollectionIdAndStage],
  (collectionVisibilities, { collectionId, stage }) => {
    return collectionVisibilities[stage][collectionId];
  }
);

const defaultVisibleFrontArticles = {
  desktop: undefined,
  mobile: undefined
};

const createSelectArticleVisibilityDetails = () => {
  const selectArticlesInCollection = createSelectArticlesInCollection();

  // Have to adapt this to work on root state
  const selectRootArticlesInCollection = (
    state: State,
    extra: {
      collectionId: string;
      collectionSet: CollectionItemSets;
    }
  ) =>
    selectArticlesInCollection(selectSharedState(state), {
      ...extra,
      includeSupportingArticles: false
    });

  return createShallowEqualResultSelector(
    selectCollectionVisibilities,
    selectCollectionSet,
    selectCollectionId,
    selectRootArticlesInCollection,
    (collectionVisibilities, collectionSet, collectionId, articles) => {
      if (collectionSet === 'previously') {
        return defaultVisibleFrontArticles;
      }
      const visibilities = collectionVisibilities[collectionSet][collectionId];

      if (!visibilities) {
        return defaultVisibleFrontArticles;
      }

      return {
        desktop: articles[visibilities.desktop - 1],
        mobile: articles[visibilities.mobile - 1]
      };
    }
  );
};

export {
  selectFront,
  selectFronts,
  selectCollectionConfig,
  selectFrontsConfig,
  selectCollectionConfigs,
  selectFrontsIds,
  selectFrontsWithPriority,
  selectAlsoOnFront,
  createSelectAlsoOnFronts,
  selectHasUnpublishedChanges,
  selectClipboard,
  selectVisibleArticles,
  selectUnlockedFrontCollections,
  createSelectArticleVisibilityDetails
};
