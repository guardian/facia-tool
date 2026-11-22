import ClipboardHeader from 'components/ClipboardHeader';
import TextInput from 'components/inputs/TextInput';
import { styled } from 'constants/theme';
import React, { useEffect, useState } from 'react';
import debounce from 'lodash/debounce';
import { liveCapi } from 'services/capiQuery';
import { CapiInteractiveAtom } from 'types/Capi';
import ScrollContainer from '../ScrollContainer';
import { InteractiveAtomFeedItem } from './InteractiveAtomFeedItem';

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

const Message = styled.div`
	margin: 4px;
`;

/**
 * Searches CAPI's /atoms endpoint for interactive atoms. Results are only
 * needed here, so they're kept in local state rather than redux.
 */
export const InteractiveAtomsSearchContainer = () => {
	const [searchText, setSearchText] = useState('');
	const [results, setResults] = useState<CapiInteractiveAtom[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | undefined>(undefined);

	useEffect(() => {
		let isCurrent = true;
		const runSearch = debounce(async () => {
			setIsLoading(true);
			try {
				const query = searchText.trim();
				const { response } = await liveCapi.atoms(query ? { q: query } : {});
				if (isCurrent) {
					setResults(response.results);
					setError(undefined);
				}
			} catch (e) {
				if (isCurrent) {
					setError(e instanceof Error ? e.message : String(e));
				}
			} finally {
				if (isCurrent) {
					setIsLoading(false);
				}
			}
		}, 500);
		runSearch();
		return () => {
			isCurrent = false;
			runSearch.cancel();
		};
	}, [searchText]);

	const renderResults = () => {
		if (error) {
			return <Message>{error}</Message>;
		}
		if (!results.length) {
			return <Message>{isLoading ? 'Loading…' : 'No results found'}</Message>;
		}
		return results.map((atom) => (
			<InteractiveAtomFeedItem key={atom.id} atom={atom} />
		));
	};

	return (
		<React.Fragment>
			<InputContainer>
				<TextInputContainer>
					<TextInput
						placeholder="Search interactive atoms"
						displaySearchIcon
						onChange={(event) => setSearchText(event.target.value)}
						value={searchText}
					/>
				</TextInputContainer>
				<ClipboardHeader />
			</InputContainer>
			<FeedsContainerWrapper>
				<ScrollContainer fixed={<h3>Results</h3>}>
					<ResultsContainer>{renderResults()}</ResultsContainer>
				</ScrollContainer>
			</FeedsContainerWrapper>
		</React.Fragment>
	);
};
