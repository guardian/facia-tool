import React from 'react';
import { styled } from 'constants/theme';
import {
	liveSelectors,
	previewSelectors,
	prefillSelectors,
	selectLiveFeedOrder,
	selectPreviewFeedOrder,
	selectPrefillFeedOrder,
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
	liveFeedOrder: FeedEntry[];
	previewFeedOrder: FeedEntry[];
	prefillFeedOrder: FeedEntry[];
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
	liveFeedOrder,
	previewFeedOrder,
	prefillFeedOrder,
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
	const feedOrder = isPrefillMode
		? prefillFeedOrder
		: isLive
			? liveFeedOrder
			: previewFeedOrder;

	return (
		<ErrorDisplay error={error || undefined}>
			{feedOrder.length ? (
				feedOrder.map((entry) =>
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
	liveFeedOrder: selectLiveFeedOrder(state),
	previewFeedOrder: selectPreviewFeedOrder(state),
	prefillFeedOrder: selectPrefillFeedOrder(state),
	liveError: liveSelectors.selectCurrentError(state),
	previewError: previewSelectors.selectCurrentError(state),
	prefillError: prefillSelectors.selectCurrentError(state),
});

export default connect(mapStateToProps)(Feed);
