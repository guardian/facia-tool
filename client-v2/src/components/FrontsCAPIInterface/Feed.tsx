import React from 'react';
import { styled } from 'constants/theme';
import FeedItem from './FeedItem';
import { CapiArticle } from 'types/Capi';

interface FeedProps {
  articles?: CapiArticle[];
  error: string | null;
}

interface ErrorDisplayProps {
  error: string | null;
  children: React.ReactNode;
}

const ErrorDisplay = ({ error, children }: ErrorDisplayProps) =>
  error ? <div>{error}</div> : <>{children}</>;

const NoResults = styled('div')`
  margin: 4px;
`;

const Feed = ({ articles = [], error }: FeedProps) => (
  <ErrorDisplay error={error}>
    {articles.length ? (
      articles
        .filter(result => result.webTitle)
        .map(article => <FeedItem key={article.id} article={article} />)
    ) : (
      <NoResults>No results found</NoResults>
    )}
  </ErrorDisplay>
);

export default Feed;
