import ClipboardHeader from 'components/ClipboardHeader';
import TextInput from 'components/inputs/TextInput';
import { styled } from 'constants/theme';
import React, { useMemo, useState } from 'react';
import { eventGraphics } from 'constants/eventGraphics';
import ScrollContainer from '../ScrollContainer';
import { EventGraphicFeedItem } from './EventGraphicFeedItem';

const InputContainer = styled.div`
	margin-bottom: 10px;
	display: flex;
	justify-content: space-between;
`;

const TextInputContainer = styled.div`
	flex-grow: 2;
`;

const ResultsContainer = styled.div`
	margin-right: 10px;
`;

const FeedsContainerWrapper = styled.div`
	height: 100%;
	min-height: 0;
`;

const NoResults = styled.div`
	margin: 4px;
`;

/**
 * Event graphics come from a hard-coded list rather than a search service, so
 * this container filters that list in memory -- there is no redux state and no
 * request to make.
 */
export const EventGraphicsSearchContainer = () => {
	const [searchText, setSearchText] = useState('');

	const results = useMemo(() => {
		const query = searchText.trim().toLowerCase();
		if (!query) {
			return eventGraphics;
		}
		return eventGraphics.filter(({ title, description, id }) =>
			[title, description, id].some((field) =>
				field?.toLowerCase().includes(query),
			),
		);
	}, [searchText]);

	return (
		<React.Fragment>
			<InputContainer>
				<TextInputContainer>
					<TextInput
						placeholder="Search event graphics"
						displaySearchIcon
						onChange={(event) => setSearchText(event.target.value)}
						value={searchText}
					/>
				</TextInputContainer>
				<ClipboardHeader />
			</InputContainer>
			<FeedsContainerWrapper>
				<ScrollContainer fixed={<h3>Results</h3>}>
					<ResultsContainer>
						{results.length ? (
							results.map((eventGraphic) => (
								<EventGraphicFeedItem
									key={eventGraphic.id}
									eventGraphic={eventGraphic}
								/>
							))
						) : (
							<NoResults>No results found</NoResults>
						)}
					</ResultsContainer>
				</ScrollContainer>
			</FeedsContainerWrapper>
		</React.Fragment>
	);
};
