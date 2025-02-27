import { FrontConfig, CollectionConfig } from 'types/FaciaApi';
import { CollectionWithNestedArticles, Card } from 'types/Collection';
import { detectPressFailureMs } from 'constants/fronts';
import { ArticleDetails } from 'types/FaciaApi';
import { Stages, Collection } from 'types/Collection';
import { frontStages } from 'constants/fronts';
import { DYNAMIC_CONTAINER_SET } from 'constants/dynamicContainers';
import { FLEXIBLE_CONTAINER_SET } from 'constants/flexibleContainers';

const getFrontCollections = (
	frontId: string | void,
	fronts: FrontConfig[],
	collections: { [id: string]: CollectionConfig },
): CollectionConfig[] => {
	if (!frontId) {
		return [];
	}
	const selectedFront: FrontConfig | void = fronts.find(
		(front: FrontConfig) => front.id === frontId,
	);

	if (selectedFront) {
		return selectedFront.collections.map(
			(collectionId) => collections[collectionId],
		);
	}

	return [];
};

const combineCollectionWithConfig = (
	collectionConfig: CollectionConfig,
	collection: CollectionWithNestedArticles,
	useCollectionDisplayName: boolean = false,
): CollectionWithNestedArticles => {
	return Object.assign({}, collection, {
		id: collection.id,
		displayName: useCollectionDisplayName
			? collection.displayName
			: collectionConfig.displayName,
		groups: collectionConfig.groups,
		groupsConfig: collectionConfig.groupsConfig,
		type: collectionConfig.type,
		frontsToolSettings: collectionConfig.frontsToolSettings,
		platform: collectionConfig.platform,
		metadata: collectionConfig.metadata,
		targetedTerritory: collectionConfig.targetedTerritory,
		displayHints: collectionConfig.displayHints,
	});
};

const populateDraftArticles = (collection: CollectionWithNestedArticles) =>
	!collection.draft ? collection.live : collection.draft;

const isFrontStale = (lastUpdated?: number, lastPressed?: number) => {
	if (lastUpdated && lastPressed) {
		return lastUpdated - lastPressed > detectPressFailureMs;
	}
	return false;
};

const getVisibilityArticleDetails = (groupsWithArticles: Card[][]) =>
	groupsWithArticles.reduce((articles, articlesInGroup, index) => {
		const numberOfGroups = groupsWithArticles.length;
		const groupArticles = articlesInGroup.map((story) => ({
			group: numberOfGroups - index - 1,
			isBoosted: !!story.meta.isBoosted,
		}));
		return articles.concat(groupArticles);
	}, [] as ArticleDetails[]);

const getGroupsByStage = (collection: Collection, stage: Stages) => {
	if (stage === frontStages.draft) {
		return (collection.draft ? collection.draft : collection.live) || [];
	}
	return collection.live ? collection.live : [];
};

const isCollectionConfigDynamic = (
	config: CollectionConfig | undefined,
): boolean => DYNAMIC_CONTAINER_SET.includes(config?.type);

const isCollectionConfigFlexible = (
	config: CollectionConfig | undefined,
): boolean => FLEXIBLE_CONTAINER_SET.includes(config?.type);

export {
	getFrontCollections,
	combineCollectionWithConfig,
	populateDraftArticles,
	isFrontStale,
	getVisibilityArticleDetails,
	getGroupsByStage,
	isCollectionConfigDynamic,
	isCollectionConfigFlexible,
};
