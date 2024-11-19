import ClipboardHeader from 'components/ClipboardHeader';
import TextInput from 'components/inputs/TextInput';
import { styled } from 'constants/theme';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	fetchRecipes,
	selectors as recipeSelectors,
} from 'bundles/recipesBundle';
import { selectors as feastKeywordsSelectors } from 'bundles/feastKeywordBundle';
import { fetchChefs, selectors as chefSelectors } from 'bundles/chefsBundle';
import { State } from 'types/State';
import { RecipeFeedItem } from './RecipeFeedItem';
import { ChefFeedItem } from './ChefFeedItem';
import { RadioButton, RadioGroup } from '../inputs/RadioButtons';
import { Dispatch } from 'types/Store';
import { IPagination } from 'lib/createAsyncResourceBundle';
import Pagination from './Pagination';
import ScrollContainer from '../ScrollContainer';
import {
	ChefSearchParams,
	DateParamField,
	RecipeSearchParams,
} from '../../services/recipeQuery';
import debounce from 'lodash/debounce';
import ButtonDefault from '../inputs/ButtonDefault';
import { fetchKeywords } from '../../bundles/feastKeywordBundle';
import { FeastKeyword } from '../../types/FeastKeyword';

const InputContainer = styled.div`
	margin-bottom: 10px;
	display: flex;
	justify-content: space-between;
`;

const TextInputContainer = styled.div`
	flex-grow: 2;
`;

interface Props {
	rightHandContainer?: React.ReactElement<any>;
}

const PaginationContainer = styled.div`
	margin-left: auto;
`;

const TopOptions = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	margin-right: 1em;
	margin-bottom: 1em;
`;

const FeedsContainerWrapper = styled.div`
	height: 100%;
	min-height: 0;
`;

const ResultsContainer = styled.div`
	margin-right: 10px;
`;

enum FeedType {
	recipes = 'recipeFeed',
	chefs = 'chefFeed',
}

export const RecipeSearchContainer = ({ rightHandContainer }: Props) => {
	const [selectedOption, setSelectedOption] = useState(FeedType.recipes);
	const [searchText, setSearchText] = useState('');

	const [showAdvancedRecipes, setShowAdvancedRecipes] = useState(false);
	const [dateField, setDateField] = useState<DateParamField>(undefined);
	const [celebrationFilter, setCelebrationFilter] = useState<string>('');
	const [orderingForce, setOrderingForce] = useState<string>('default');
	const [forceDates, setForceDates] = useState(false);

	const dispatch: Dispatch = useDispatch();
	const searchForChefs = useCallback(
		(params: ChefSearchParams) => {
			dispatch(fetchChefs(params));
		},
		[dispatch],
	);
	const searchForRecipes = useCallback(
		(params: RecipeSearchParams) => {
			dispatch(fetchRecipes(params));
		},
		[dispatch],
	);
	const recipeSearchIds = useSelector((state: State) =>
		recipeSelectors.selectLastFetchOrder(state),
	);

	const chefSearchIds = useSelector((state: State) =>
		chefSelectors.selectLastFetchOrder(state),
	);

	const knownCelebrations = useSelector(
		feastKeywordsSelectors.selectCelebrationKeywords,
	) as FeastKeyword[];

	const [page, setPage] = useState(1);

	useEffect(() => {
		dispatch(fetchKeywords('celebration'));
	}, []);

	useEffect(() => {
		const dbf = debounce(() => runSearch(page), 750);
		dbf();
		return () => dbf.cancel();
	}, [selectedOption, searchText, page, dateField, orderingForce]);

	const chefsPagination: IPagination | null = useSelector((state: State) =>
		chefSelectors.selectPagination(state),
	);

	const hasPages = (chefsPagination?.totalPages ?? 0) > 1;

	const getUpdateConfig = () => {
		switch (orderingForce) {
			case 'gentle':
				return {
					decay: 0.95,
					dropoffScaleDays: 90,
					offsetDays: 7,
				};
			case 'forceful':
				return {
					decay: 0.7,
					dropoffScaleDays: 180,
					offsetDays: 14,
				};
			case 'default':
			default:
				return undefined;
		}
	};

	const runSearch = useCallback(
		(page: number = 1) => {
			switch (selectedOption) {
				case FeedType.chefs:
					searchForChefs({
						query: searchText,
					});
					break;
				case FeedType.recipes:
					searchForRecipes({
						queryText: searchText,
						uprateByDate: dateField,
						uprateConfig: getUpdateConfig(),
					});
					break;
			}
		},
		[selectedOption, searchText, page, dateField, orderingForce],
	);

	const renderTheFeed = () => {
		switch (selectedOption) {
			case FeedType.recipes:
				return recipeSearchIds.map((id) => (
					<RecipeFeedItem
						key={id}
						id={id}
						showTimes={forceDates || !!dateField}
					/>
				));
			case FeedType.chefs:
				//Fixing https://the-guardian.sentry.io/issues/5820707430/?project=35467&referrer=issue-stream&statsPeriod=90d&stream_index=0&utc=true
				//It seems that some null values got into the `chefSearchIds` list
				return chefSearchIds
					.filter((chefId) => !!chefId)
					.map((chefId) => <ChefFeedItem key={chefId} id={chefId} />);
		}
	};

	return (
		<React.Fragment>
			<InputContainer>
				<TextInputContainer>
					<TextInput
						placeholder={
							selectedOption === FeedType.recipes
								? 'Search recipes'
								: 'Search chefs'
						}
						displaySearchIcon
						onChange={(event) => {
							setPage(1);
							setSearchText(event.target.value);
						}}
						onClick={() => setShowAdvancedRecipes(true)}
						value={searchText}
					/>
				</TextInputContainer>
				<ClipboardHeader />
			</InputContainer>

			{showAdvancedRecipes && selectedOption === FeedType.recipes ? (
				<>
					<TopOptions>
						<div>
							<label htmlFor="celebrationSelector">Celebrations</label>
						</div>
						<div>
							<select
								id="celebrationSelector"
								value={celebrationFilter}
								onChange={(evt) => setCelebrationFilter(evt.target.value)}
							>
								<option value={''}></option>
								{knownCelebrations.map((c) => (
									<option value={c.id}>{c.id}</option>
								))}
							</select>
						</div>
					</TopOptions>
					<TopOptions>
						<div>
							<label
								htmlFor="dateSelector"
								style={{ color: searchText == '' ? 'gray' : 'inherit' }}
							>
								Ordering priority
							</label>
						</div>
						<div>
							<select
								id="dateSelector"
								value={dateField}
								disabled={searchText == ''}
								onChange={(evt) => {
									setDateField(
										evt.target.value === 'relevance'
											? undefined
											: (evt.target.value as DateParamField),
									);
								}}
							>
								<option value={'relevance'}>
									Most relevant, regardless of time
								</option>
								<option value={'publishedDate'}>Most recently published</option>
								<option value={'firstPublishedDate'}>
									Most recent first publication
								</option>
								<option value={'lastModifiedDate'}>
									Most recently modified
								</option>
							</select>
						</div>
					</TopOptions>
					<TopOptions>
						<div>
							<label
								htmlFor="orderingForce"
								style={{ color: !dateField ? 'gray' : 'inherit' }}
							>
								Ordering preference
							</label>
						</div>
						<div>
							<select
								id="orderingForce"
								value={orderingForce}
								disabled={!dateField}
								onChange={(evt) => setOrderingForce(evt.target.value)}
							>
								<option value={'default'}>Default</option>
								<option value={'gentle'}>Prefer relevance</option>
								<option value={'forceful'}>Prefer date</option>
							</select>
						</div>
					</TopOptions>
					<TopOptions>
						<div>
							<label htmlFor="forceDateDisplay">Always show dates</label>
						</div>
						<div>
							<input
								type="checkbox"
								checked={forceDates}
								onChange={(evt) => setForceDates(evt.target.checked)}
							/>
						</div>
					</TopOptions>
					<TopOptions
						style={{
							paddingBottom: '0.5em',
							borderBottom: '1px solid gray',
							marginBottom: '0.5em',
						}}
					>
						<ButtonDefault onClick={() => setShowAdvancedRecipes(false)}>
							Close
						</ButtonDefault>
					</TopOptions>
				</>
			) : undefined}

			<TopOptions>
				<RadioGroup>
					<RadioButton
						checked={selectedOption === FeedType.recipes}
						onChange={() => setSelectedOption(FeedType.recipes)}
						label="Recipes"
						inline
						name="recipeFeed"
					/>
					<RadioButton
						checked={selectedOption === FeedType.chefs}
						onChange={() => setSelectedOption(FeedType.chefs)}
						label="Chefs"
						inline
						name="chefFeed"
					/>
				</RadioGroup>
				{selectedOption === FeedType.chefs && chefsPagination && hasPages && (
					<PaginationContainer>
						<Pagination
							pageChange={(page) => setPage(page)}
							currentPage={chefsPagination.currentPage}
							totalPages={chefsPagination.totalPages}
						/>
					</PaginationContainer>
				)}
			</TopOptions>
			<FeedsContainerWrapper>
				<ScrollContainer fixed={<h3>Results</h3>}>
					<ResultsContainer>{renderTheFeed()}</ResultsContainer>
				</ScrollContainer>
			</FeedsContainerWrapper>
		</React.Fragment>
	);
};
