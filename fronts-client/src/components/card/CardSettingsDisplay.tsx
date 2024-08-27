import React from 'react';
import { styled, theme } from 'constants/theme';
import { FLEXIBLE_CONTAINER_SET } from 'constants/flexibleContainers';

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
    <div>
      {isBreaking && (
        <span data-testid="breaking-news">
          Breaking news
        </span>
      )}
      {showByline && (
        <span>Show byline</span>
      )}
      {showQuotedHeadline && (
        <span>Quote headline</span>
      )}
      {showLargeHeadline && (
        <span>Large headline</span>
      )}
      {shouldShowBoostLevel(collectionType, boostLevel) && (
        <span>
          {getBoostLevelLabel(boostLevel)}
        </span>
      )}
      {shouldShowLegacyBoost(collectionType, isBoosted) && (
        <span>Boost</span>
      )}
    </div>
  ) : null;
