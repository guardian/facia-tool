import React from 'react';
import { styled } from 'constants/theme';
import {
	liveSelectors,
	previewSelectors,
	prefillSelectors,
	selectLiveFeedEntries,
	selectPreviewFeedEntries,
	selectPrefillFeedEntries,
	FeedEntry,
} from 'bundles/capiFeedBundle';
import { selectIsPrefillMode } from 'selectors/feedStateSelectors';
import type { State } from 'types/State';
import { connect } from 'react-redux';
import { ArticleFeedItem } from './ArticleFeedItem';
import { AtomFeedItem } from './AtomFeedItem';

interface ErrorDisplayProps {
	error?: string;
	children: React.ReactNode;
}

interface FeedContainerProps {
	isPrefillMode: boolean;
	liveFeedEntries: FeedEntry[];
	previewFeedEntries: FeedEntry[];
	prefillFeedEntries: FeedEntry[];
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
	liveFeedEntries,
	previewFeedEntries,
	prefillFeedEntries,
	liveError,
	previewError,
	prefillError,
	isPrefillMode,
	isLive,
}: FeedComponentProps) => {
	const error = isPrefillMode
		? prefillError
		: isLive
			? liveError
			: previewError;
	const feedEntries = isPrefillMode
		? prefillFeedEntries
		: isLive
			? liveFeedEntries
			: previewFeedEntries;

	return (
		<ErrorDisplay error={error || undefined}>
			{feedEntries.length ? (
				feedEntries.map((entry) =>
					entry.type === 'atom' ? (
						<AtomFeedItem key={entry.id} id={entry.id} />
					) : (
						<ArticleFeedItem key={entry.id} id={entry.id} />
					),
				)
			) : (
				<NoResults>No results found</NoResults>
			)}
		</ErrorDisplay>
	);
};

const mapStateToProps = (state: State) => ({
	isPrefillMode: selectIsPrefillMode(state),
	liveFeedEntries: selectLiveFeedEntries(state),
	previewFeedEntries: selectPreviewFeedEntries(state),
	prefillFeedEntries: selectPrefillFeedEntries(state),
	liveError: liveSelectors.selectCurrentError(state),
	previewError: previewSelectors.selectCurrentError(state),
	prefillError: prefillSelectors.selectCurrentError(state),
});

export default connect(mapStateToProps)(Feed);
