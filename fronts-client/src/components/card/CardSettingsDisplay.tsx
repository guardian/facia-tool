import React from 'react';
import { styled, theme } from 'constants/theme';
import { FLEXIBLE_CONTAINER_SET } from 'constants/flexibleContainers';

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

const shouldShowLegacyBoost = (collectionType?: string, isBoosted?: boolean) =>
	/* don't show old Boost option in flexible containers */
	isBoosted && !FLEXIBLE_CONTAINER_SET.includes(collectionType);

const shouldShowBoostLevel = (collectionType?: string, boostLevel?: string) =>
	boostLevel !== 'default' &&
	/* show new Boost level in flexible containers or clipboard */
	(FLEXIBLE_CONTAINER_SET.includes(collectionType) || !collectionType);

const getBoostLevelLabel = (boostLevel?: string): string | undefined => {
	switch (boostLevel) {
		case 'gigaboost':
			return 'Giga boost';
		case 'megaboost':
			return 'Mega boost';
		case 'boost':
			return 'Boost';
		default:
			return undefined;
	}
};

export default ({
	collectionType,
	isBreaking,
	showByline,
	showQuotedHeadline,
	showLargeHeadline,
	isBoosted,
	boostLevel,
}: {
	collectionType?: string;
	isBreaking?: boolean;
	showByline?: boolean;
	showQuotedHeadline?: boolean;
	showLargeHeadline?: boolean;
	isBoosted?: boolean;
	boostLevel?: string;
}) =>
	shouldShowBoostLevel(collectionType, boostLevel) ||
	shouldShowLegacyBoost(collectionType, isBoosted) ||
	isBreaking ||
	showByline ||
	showQuotedHeadline ||
	showLargeHeadline ||
	isBoosted ? (
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
			{showLargeHeadline && (
				<ArticleMetadataProperty>Large headline</ArticleMetadataProperty>
			)}
			{shouldShowBoostLevel(collectionType, boostLevel) && (
				<ArticleMetadataProperty>
					{getBoostLevelLabel(boostLevel)}
				</ArticleMetadataProperty>
			)}
			{shouldShowLegacyBoost(collectionType, isBoosted) && (
				<ArticleMetadataProperty>Boost</ArticleMetadataProperty>
			)}
		</ArticleMetadataProperties>
	) : null;
