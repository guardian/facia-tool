import { FLEXIBLE_CONTAINER_SET } from 'constants/flexibleContainers';
import { styled, theme } from 'constants/theme';
import React from 'react';
import type { BoostLevels } from 'types/Collection';
import { CollectionToggles as BoostToggles } from '../form/BoostToggles';

const ArticleMetadataProperties = styled.div`
	padding: 0 4px 3px 0;
	display: flex;
	flex-direction: row;
	font-size: 12px;
	flex-wrap: wrap;
`;

const ArticleMetadataProperty = styled.div`
	background-color: ${theme.colors.whiteDark};
	padding: 1px 4px;
	flex: 0 0 auto;
	margin: 0 2px 1px 0;
`;

const shouldShowBoostLevel = (
	collectionType?: string,
	boostLevel?: BoostLevels,
) =>
	boostLevel !== 'default' &&
	/* show new Boost level in flexible containers or clipboard */
	(FLEXIBLE_CONTAINER_SET.includes(collectionType) || !collectionType);

export const getBoostLevelLabel = (
	boostLevel?: BoostLevels,
	groupIndex?: number,
	collectionType?: string,
): string | undefined => {
	if (
		!boostLevel ||
		groupIndex === undefined ||
		!collectionType ||
		!['flexible/general', 'flexible/special'].includes(collectionType)
	)
		return undefined;

	const toggles = BoostToggles[collectionType]?.[groupIndex];
	const label = toggles?.find((toggle) => toggle.value === boostLevel)?.label;
	// If the label is 'Default', return undefined so that it doesn't appear in the UI
	return label === 'Default' ? undefined : label;
};

export default ({
	collectionType,
	isBreaking,
	showByline,
	showQuotedHeadline,
	showLargeHeadline,
	boostLevel,
	isImmersive,
	groupIndex,
}: {
	collectionType?: string;
	isBreaking?: boolean;
	showByline?: boolean;
	showQuotedHeadline?: boolean;
	showLargeHeadline?: boolean;
	boostLevel?: BoostLevels;
	isImmersive?: boolean;
	groupIndex?: number;
}) =>
	shouldShowBoostLevel(collectionType, boostLevel) ||
	isBreaking ||
	showByline ||
	showQuotedHeadline ||
	showLargeHeadline ||
	isImmersive ? (
		<ArticleMetadataProperties>
			{isBreaking && (
				<ArticleMetadataProperty data-testid="breaking-news">
					Breaking news
				</ArticleMetadataProperty>
			)}
			{showByline && (
				<ArticleMetadataProperty>Show byline</ArticleMetadataProperty>
			)}
			{showQuotedHeadline && (
				<ArticleMetadataProperty>Quote headline</ArticleMetadataProperty>
			)}
			{isImmersive && (
				<ArticleMetadataProperty>Immersive</ArticleMetadataProperty>
			)}
			{showLargeHeadline && (
				<ArticleMetadataProperty>Large headline</ArticleMetadataProperty>
			)}
			{shouldShowBoostLevel(collectionType, boostLevel) && (
				<ArticleMetadataProperty>
					{getBoostLevelLabel(boostLevel, groupIndex, collectionType)}
				</ArticleMetadataProperty>
			)}
		</ArticleMetadataProperties>
	) : null;
