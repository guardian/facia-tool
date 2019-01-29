import React from 'react';
import { styled } from 'constants/theme';
import FeedItem from './FeedItem';
import { CapiArticle } from 'types/Capi';

const getId = (internalPageCode: string | number | undefined) =>
  `internal-code/page/${internalPageCode}`;

interface FeedProps {
  articles?: CapiArticle[];
  error: string | null;
  loading: boolean;
}

interface ErrorDisplayProps {
  error: string | null;
  children: React.ReactNode;
}

const ErrorDisplay = ({ error, children }: ErrorDisplayProps) =>
  error ? <div>{error}</div> : <>{children}</>;

interface LoaderDisplayProps {
  children: React.ReactNode;
  loading: boolean;
}

const LoaderDisplay = ({ loading, children }: LoaderDisplayProps) =>
  loading ? <div>Loading!</div> : <>{children}</>;

const NoResults = styled('div')`
  margin: 4px;
`;

const Feed = ({ articles = [], error, loading }: FeedProps) => (
  <ErrorDisplay error={error}>
    <LoaderDisplay loading={loading}>
      {articles.length ? (
        articles
          .filter(result => result.webTitle)
          .map(
            ({
              id,
              webTitle,
              webUrl,
              webPublicationDate,
              sectionName,
              fields,
              pillarId
            }) => (
              <FeedItem
                id={id}
                key={webUrl}
                title={webTitle}
                href={webUrl}
                publicationDate={webPublicationDate}
                sectionName={sectionName}
                pillarId={pillarId}
                internalPageCode={fields && getId(fields.internalPageCode)}
                firstPublicationDate={fields.firstPublicationDate}
                isLive={!fields.isLive || fields.isLive === 'true'}
                scheduledPublicationDate={fields.scheduledPublicationDate}
              />
            )
          )
      ) : (
        <NoResults>No results found</NoResults>
      )}
    </LoaderDisplay>
  </ErrorDisplay>
);

export default Feed;
