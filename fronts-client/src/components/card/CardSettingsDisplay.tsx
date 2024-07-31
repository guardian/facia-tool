import React from 'react';
import { styled, theme } from 'constants/theme';
import {
  DYNAMIC_CONTAINER_V1_SET,
  DYNAMIC_CONTAINER_V2_SET,
} from 'constants/dynamicContainers';

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
  DYNAMIC_CONTAINER_V1_SET.includes(collectionType) || isBoosted;

const shouldShowBoostLevel = (collectionType?: string, boostLevel?: string) =>
  DYNAMIC_CONTAINER_V2_SET.includes(collectionType) && boostLevel !== 'default';

const displayBoostLevel = (boostLevel?: string) => {
  if (boostLevel === 'gigaboost') return 'Giga boost';
  else if (boostLevel === 'megaboost') return 'Mega boost';
  else if (boostLevel === 'boost') return 'Boost';
  else return '';
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
          {displayBoostLevel(boostLevel)}
        </ArticleMetadataProperty>
      )}
      {shouldShowLegacyBoost(collectionType, isBoosted) && (
        <ArticleMetadataProperty>Boost</ArticleMetadataProperty>
      )}
    </ArticleMetadataProperties>
  ) : null;
