import React, { useState } from 'react';
import { styled, theme } from 'constants/theme';

import { selectors as editionsIssueSelectors } from '../../bundles/editionsIssueBundle';
import SectionContent from '../layout/SectionContent';
import CapiSearchContainer from './CapiSearchContainer';
import Clipboard from '../Clipboard';
import FeedSectionHeader from './FeedSectionHeader';
import { media } from 'util/mediaQueries';
import { connect } from 'react-redux';
import { State } from 'types/State';
import { RecipeSearchContainer } from './RecipeSearchContainer';
import { EventGraphicsSearchContainer } from './EventGraphicsSearchContainer';
import { selectFeatureValue } from 'selectors/featureSwitchesSelectors';

interface Props {
	isClipboardOpen: boolean;
	isFeast: boolean;
	showEventGraphics: boolean;
}

export enum FeedSource {
	articles = 'articles',
	eventGraphics = 'eventGraphics',
}

const FeedSectionContainer = styled.div`
	background-color: ${theme.base.colors.backgroundColor};
`;

const FeedSectionContent = styled(SectionContent)`
	padding-right: 0px;
	padding-bottom: 0;
`;

const FeedWrapper = styled.div<{ isClipboardOpen: boolean }>`
	display: flex;
	flex-direction: column;
	width: 409px;
	${media.large`width: 335px;`}
	border-right: ${({ isClipboardOpen }) =>
		isClipboardOpen ? `solid 1px ${theme.base.colors.borderColor}` : null};
`;

const FeedSourceSelectorContainer = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 10px;
	margin-right: 10px;
`;

const FeedSourceLabel = styled.label`
	font-size: 14px;
	white-space: nowrap;
`;

const FeedSourceSelect = styled.select`
	flex: 1;
	height: 36px;
	padding: 0 8px;
	font-size: 16px;
	color: ${theme.base.colors.text};
	background-color: ${theme.base.colors.backgroundColorLight};
	border: 1px solid ${theme.base.colors.borderColor};
	border-radius: 3px;

	&:focus {
		outline: none;
		border-color: ${theme.base.colors.borderColorFocus};
	}
`;

/**
 * The feed for regular (non-feast) fronts, which can show either CAPI content
 * or the list of available event graphics.
 */
const FrontsFeed = () => {
	const [source, setSource] = useState(FeedSource.articles);

	return (
		<>
			<FeedSourceSelectorContainer>
				<FeedSourceLabel htmlFor="feedSourceSelector">
					Filter by type:
				</FeedSourceLabel>
				<FeedSourceSelect
					id="feedSourceSelector"
					data-testid="feed-source-selector"
					value={source}
					onChange={(event) => setSource(event.target.value as FeedSource)}
				>
					<option value={FeedSource.articles}>Articles</option>
					<option value={FeedSource.eventGraphics}>Event graphics</option>
				</FeedSourceSelect>
			</FeedSourceSelectorContainer>
			{source === FeedSource.eventGraphics ? (
				<EventGraphicsSearchContainer />
			) : (
				<CapiSearchContainer />
			)}
		</>
	);
};

const FeedSection = ({
	isClipboardOpen,
	isFeast,
	showEventGraphics,
}: Props) => (
	<FeedSectionContainer>
		<FeedSectionHeader />
		<FeedSectionContent>
			<FeedWrapper isClipboardOpen={isClipboardOpen}>
				{isFeast ? (
					<RecipeSearchContainer />
				) : showEventGraphics ? (
					<FrontsFeed />
				) : (
					<CapiSearchContainer />
				)}
			</FeedWrapper>
			<Clipboard />
		</FeedSectionContent>
	</FeedSectionContainer>
);

const mapStateToProps = (state: State) => ({
	isFeast: editionsIssueSelectors.selectAll(state)?.platform === 'feast',
	showEventGraphics: selectFeatureValue(state, 'event-graphics'),
});

export default connect(mapStateToProps)(FeedSection);
