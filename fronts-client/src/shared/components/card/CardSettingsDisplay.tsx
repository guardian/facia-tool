import React from 'react';
import { styled, theme } from 'constants/theme';

const ArticleMetadataProperties = styled.div`
  padding: 0 4px 3px 0;
  display: flex;
  flex-direction: row;
  font-size: 12px;
  flex-wrap: wrap;
`;

const ArticleMetadataProperty = styled.div`
  background-color: ${theme.shared.colors.whiteDark};
  padding: 1px 4px;
  flex: 0 0 auto;
  margin: 0 2px 1px 0;
`;

export default ({
  isBreaking,
  showByline,
  showQuotedHeadline,
  showLargeHeadline,
  isBoosted
}: {
  isBreaking?: boolean;
  showByline?: boolean;
  showQuotedHeadline?: boolean;
  showLargeHeadline?: boolean;
  isBoosted?: boolean;
}) =>
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
      {isBoosted && <ArticleMetadataProperty>Boost</ArticleMetadataProperty>}
    </ArticleMetadataProperties>
  ) : null;
