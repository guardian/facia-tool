import React from 'react';
import { styled } from 'constants/theme';
import {
	liveSelectors,
	previewSelectors,
	prefillSelectors,
} from 'bundles/capiFeedBundle';
import { selectIsPrefillMode } from 'selectors/feedStateSelectors';
import type { State } from 'types/State';
import { connect } from 'react-redux';
import { ArticleFeedItem } from './ArticleFeedItem';

interface ErrorDisplayProps {
	error?: string;
	children: React.ReactNode;
}

interface FeedContainerProps {
	isPrefillMode: boolean;
	liveArticleIds: string[];
	previewArticleIds: string[];
	prefillArticleIds: string[];
	liveError: string | null;
	previewError: string | null;
	prefillError: string | null;
}

interface FeedComponentProps extends FeedContainerProps {
	isLive: boolean;
}

const ErrorDisplay = ({ error, children }: ErrorDisplayProps) =>
	error ? <div>{error}</div> : <>{children}</>;

const NoResults = styled.div`
	margin: 4px;
`;

const Feed = ({
	liveArticleIds: liveArticles,
	previewArticleIds: previewArticles,
	liveError,
	previewError,
	prefillArticleIds: prefillArticles,
	prefillError,
	isPrefillMode,
	isLive,
}: FeedComponentProps) => {
	const error = isPrefillMode
		? prefillError
		: isLive
			? liveError
			: previewError;
	const articleIds = isPrefillMode
		? prefillArticles
		: isLive
			? liveArticles
			: previewArticles;

	return (
		<ErrorDisplay error={error || undefined}>
			{articleIds.length ? (
				articleIds.map((id) => <ArticleFeedItem key={id} id={id} />)
			) : (
				<NoResults>No results found</NoResults>
			)}
		</ErrorDisplay>
	);
};

const mapStateToProps = (state: State) => ({
	isPrefillMode: selectIsPrefillMode(state),
	liveArticleIds: liveSelectors.selectLastFetchOrder(state),
	previewArticleIds: previewSelectors.selectLastFetchOrder(state),
	prefillArticleIds: prefillSelectors.selectLastFetchOrder(state),
	liveError: liveSelectors.selectCurrentError(state),
	previewError: previewSelectors.selectCurrentError(state),
	prefillError: prefillSelectors.selectCurrentError(state),
});

export default connect(mapStateToProps)(Feed);
