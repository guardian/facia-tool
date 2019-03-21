import React from 'react';
import { styled } from 'constants/theme';
import FeedItem from './FeedItem';
import { CapiArticle } from 'types/Capi';
import { getThumbnail } from 'util/CAPIUtils';

const getId = (internalPageCode: string | number | undefined) =>
  `internal-code/page/${internalPageCode}`;

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
        .map(article => (
          <FeedItem
            id={article.id}
            key={article.webUrl}
            title={article.webTitle}
            href={article.webUrl}
            publicationDate={article.webPublicationDate}
            sectionName={article.sectionName}
            pillarId={article.pillarId}
            internalPageCode={
              article.fields && getId(article.fields.internalPageCode)
            }
            firstPublicationDate={article.fields.firstPublicationDate}
            isLive={!article.fields.isLive || article.fields.isLive === 'true'}
            scheduledPublicationDate={article.fields.scheduledPublicationDate}
            thumbnail={getThumbnail(article, article.frontsMeta.defaults)}
            tone={article.frontsMeta.tone}
          />
        ))
    ) : (
      <NoResults>No results found</NoResults>
    )}
  </ErrorDisplay>
);

export default Feed;
