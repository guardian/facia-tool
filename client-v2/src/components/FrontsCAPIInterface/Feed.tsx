import React from 'react';
import { styled } from 'constants/theme';
import FeedItem from './FeedItem';

interface FeedProps {
  articleIds?: string[];
  error?: string;
}

interface ErrorDisplayProps {
  error?: string;
  children: React.ReactNode;
}

const ErrorDisplay = ({ error, children }: ErrorDisplayProps) =>
  error ? <div>{error}</div> : <>{children}</>;

const NoResults = styled.div`
  margin: 4px;
`;

const Feed = ({ articleIds = [], error }: FeedProps) => (
  <ErrorDisplay error={error}>
    {articleIds.length ? (
      articleIds.map(id => <FeedItem key={id} id={id} />)
    ) : (
      <NoResults>No results found</NoResults>
    )}
  </ErrorDisplay>
);

export default Feed;
