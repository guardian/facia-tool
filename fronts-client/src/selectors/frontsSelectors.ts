import { createSelector } from 'reselect';
import {
	FrontConfig,
	CollectionConfig,
	VisibleArticlesResponse,
} from 'types/FaciaApi';
import type { State } from 'types/State';
import { breakingNewsFrontId } from 'constants/fronts';
import { selectors as frontsConfigSelectors } from 'bundles/frontsConfigBundle';
import { selectCollectionsWhichAreAlsoOnOtherFronts } from './alsoOnSelectors';

import { CardSets, Stages } from 'types/Collection';
import {
	createSelectCardsInCollection,
	createSelectCollection,
	selectFront,
	selectFronts,
	selectFrontId,
} from 'selectors/shared';
import { createShallowEqualResultSelector } from 'util/selectorUtils';

interface FrontConfigMap {
	[id: string]: FrontConfig;
}

interface CollectionConfigMap {
	[id: string]: CollectionConfig;
}

interface FrontsByPriority {
	[id: string]: FrontConfig[];
}

const selectUnlockedFrontCollections = (
	state: State,
	frontId: string,
): string[] =>
	selectFront(state, { frontId }).collections.reduce(
		(unlockedCollections: string[], collectionId) => {
			const collection = selectCollectionConfig(state, collectionId);
			if (!collection.uneditable) {
				unlockedCollections.push(collectionId);
			}
			return unlockedCollections;
		},
		[],
	);

const getFrontsByPriority = createSelector(
	[selectFronts],
	(fronts: FrontConfigMap): FrontsByPriority =>
		Object.keys(fronts)
			.filter((id) => id !== breakingNewsFrontId)
			.reduce((acc: FrontsByPriority, id): FrontsByPriority => {
				const front = fronts[id];
				return {
					...acc,
					[front.priority]: [...(acc[front.priority] || []), fronts[id]],
				};
			}, {}),
);

const selectPriority = (state: State, { priority }: { priority: string }) =>
	priority;

const selectCollectionSet = (
	state: State,
	{ collectionSet }: { collectionSet: CardSets },
) => collectionSet;

const selectCollectionIdAndStage = (
	state: State,
	{ stage, collectionId }: { stage: Stages; collectionId: string },
) => ({
	stage,
	collectionId,
});

const selectCollectionVisibilities = (state: State) =>
	state.fronts.collectionVisibility;

const selectCollectionId = (
	state: State,
	{ collectionId }: { collectionId: string },
) => collectionId;

const selectUnpublishedChanges = (state: State) => state.unpublishedChanges;

const selectFrontsAsArray = createSelector([selectFronts], (fronts) => {
	if (!fronts) {
		return [];
	}
	return Object.keys(fronts).reduce((frontsAsArray, frontId) => {
		const front = fronts[frontId];
		const withId = Object.assign({}, front, { id: frontId });
		frontsAsArray.push(withId);
		return frontsAsArray;
	}, [] as FrontConfig[]);
});

const defaultFrontsWithPriority = [] as [];

const selectFrontsWithPriority = (
	state: State,
	priority: string,
): FrontConfig[] =>
	getFrontsByPriority(state)[priority] || defaultFrontsWithPriority;

const getCollections = (state: State): CollectionConfigMap =>
	frontsConfigSelectors.selectAll(state).collections || {};

const selectCollectionConfig = (state: State, id: string): CollectionConfig =>
	getCollections(state)[id];

const selectCollectionHasPrefill = (state: State, id: string): boolean =>
	!!(selectCollectionConfig(state, id) || { prefill: undefined }).prefill;

const selectCollection = createSelectCollection();

const selectCollectionIsHidden = (
	state: State,
	collectionId: string,
): boolean => {
	const collection = selectCollection(state, {
		collectionId,
	});
	return !!collection && !!collection.isHidden;
};

export const selectCollectionCanMoveToRelativeIndex = (
	state: State,
	frontId: string,
	collectionId: string,
	relativeIndex: number,
): boolean => {
	const front = selectFront(state, { frontId });
	const currentIndex = front.collections.findIndex((id) => id === collectionId);
	if (currentIndex === -1) {
		return false;
	}

	const newIndex = currentIndex + relativeIndex;

	return newIndex >= 0 && newIndex <= front.collections.length - 1;
};

const selectCollectionDisplayName = (
	state: State,
	collectionId: string,
): string => {
	const collection = selectCollection(state, {
		collectionId,
	});
	return !!collection ? collection.displayName : '';
};

const selectCollectionTargetedRegions = (
	state: State,
	collectionId: string,
): string[] => {
	const collection = selectCollection(state, {
		collectionId,
	});

	return !!collection ? collection.targetedRegions : [];
};

const selectCollectionType = (
	state: State,
	collectionId: string,
): string | undefined => {
	const collection = selectCollection(state, {
		collectionId,
	});
	return collection?.type;
};

const selectFrontsIds = createSelector([selectFronts], (fronts): string[] => {
	if (!fronts) {
		return [];
	}
	return Object.keys(fronts)
		.filter((frontId) => frontId !== breakingNewsFrontId)
		.sort();
});

const deriveFrontsFromIdsAndPriority = (
	fronts: FrontConfigMap,
	collections: CollectionConfigMap,
	frontIds: string[],
	priority: string,
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
		[],
	);
	return {
		fronts: frontsWithPriority,
		collections,
	};
};

const getCollectionConfigs = (
	frontId: string | void,
	fronts: FrontConfig[],
	collections: CollectionConfigMap,
): CollectionConfig[] => {
	if (!frontId) {
		return [];
	}

	const selectedFront = fronts.find((front) => front.id === frontId);

	if (selectedFront) {
		return selectedFront.collections.map((collectionId) =>
			Object.assign({}, collections[collectionId], { id: collectionId }),
		);
	}

	return [];
};

const getUnpublishedChangesStatus = (
	collectionId: string,
	unpublishedChanges: { [id: string]: boolean },
): boolean => (unpublishedChanges ? unpublishedChanges[collectionId] : false);

const selectCollectionConfigs = createSelector(
	[selectFrontId, selectFrontsAsArray, getCollections],
	getCollectionConfigs,
);

const selectFrontsConfig = createSelector(
	[selectFronts, getCollections, selectFrontsIds, selectPriority],
	deriveFrontsFromIdsAndPriority,
);

const selectHasUnpublishedChanges = createSelector(
	[selectCollectionId, selectUnpublishedChanges],
	getUnpublishedChangesStatus,
);

const createSelectCollectionsWhichAreAlsoOnOtherFronts = () =>
	createSelector(
		[selectFront, selectFrontsAsArray],
		selectCollectionsWhichAreAlsoOnOtherFronts,
	);

const selectClipboard = (state: State) => state.clipboard;

const selectVisibleArticles = createSelector(
	[selectCollectionVisibilities, selectCollectionIdAndStage],
	(
		collectionVisibilities,
		{ collectionId, stage },
	): VisibleArticlesResponse | undefined => {
		return collectionVisibilities[stage][collectionId];
	},
);

const defaultVisibleFrontArticles = {
	desktop: undefined,
	mobile: undefined,
};

const createSelectArticleVisibilityDetails = () => {
	const selectArticlesInCollection = createSelectCardsInCollection();

	// Have to adapt this to work on root state
	const selectRootArticlesInCollection = (
		state: State,
		extra: {
			collectionId: string;
			collectionSet: CardSets;
		},
	) =>
		selectArticlesInCollection(state, {
			...extra,
			includeSupportingArticles: false,
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
				mobile: articles[visibilities.mobile - 1],
			};
		},
	);
};

export {
	selectCollectionConfig,
	selectCollectionHasPrefill,
	selectCollectionIsHidden,
	selectCollectionDisplayName,
	selectCollectionTargetedRegions,
	selectCollectionType,
	selectFrontsConfig,
	selectCollectionConfigs,
	selectFrontsIds,
	selectFrontsWithPriority,
	selectCollectionsWhichAreAlsoOnOtherFronts,
	createSelectCollectionsWhichAreAlsoOnOtherFronts,
	selectHasUnpublishedChanges,
	selectClipboard,
	selectVisibleArticles,
	selectUnlockedFrontCollections,
	createSelectArticleVisibilityDetails,
};
