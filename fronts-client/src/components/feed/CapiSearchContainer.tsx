import React from 'react';
import { connect } from 'react-redux';
import { styled, theme } from 'constants/theme';
import SearchInput, { SearchInputState, initState } from './SearchInput';
import Feed from './Feed';
import { RadioButton, RadioGroup } from '../inputs/RadioButtons';
import type { State } from 'types/State';
import {
	liveSelectors,
	previewSelectors,
	fetchLive,
	fetchPreview,
	prefillSelectors,
	hidePrefills,
} from 'bundles/capiFeedBundle';
import { getTodayDate } from 'util/getTodayDate';
import { getIdFromURL } from 'util/CAPIUtils';
import { Dispatch } from 'types/Store';
import debounce from 'lodash/debounce';
import Pagination from './Pagination';
import { IPagination } from 'lib/createAsyncResourceBundle';
import ShortVerticalPinline from 'components/layout/ShortVerticalPinline';
import { DEFAULT_PARAMS } from 'services/faciaApi';
import ScrollContainer from '../ScrollContainer';
import ClipboardHeader from 'components/ClipboardHeader';
import ContainerHeading from 'components/typography/ContainerHeading';
import { ClearIcon } from 'components/icons/Icons';
import Button from 'components/inputs/ButtonDefault';
import { selectIsPrefillMode } from 'selectors/feedStateSelectors';
import { feedArticlesPollInterval } from 'constants/polling';
import { SearchTitle } from './SearchTitle';
import { SearchResultsHeadingContainer } from './SearchResultsHeadingContainer';

interface CapiSearchContainerProps {
	fetchLive: (params: object, isResource: boolean) => void;
	fetchPreview: (params: object, isResource: boolean) => void;
	hidePrefills: () => void;
	isPrefillMode: boolean;
	livePagination: IPagination | null;
	previewPagination: IPagination | null;
	liveLoading: boolean;
	previewLoading: boolean;
	prefillLoading: boolean;
}

interface CapiSearchContainerState {
	capiFeedIndex: number;
	displaySearchFilters: boolean;
	inputState: SearchInputState;
	displayPrevResults: boolean;
	sortByParam: string;
}

const RefreshButton = styled.button`
	padding-left: 0;
	appearance: none;
	border: none;
	background: transparent;
	color: ${theme.base.colors.text};
	cursor: pointer;
	font-family: inherit;
	font-size: 13px;
	font-weight: bold;
	outline: none;

	&:hover {
		color: ${theme.base.colors.buttonFocused};
	}

	&:disabled {
		color: ${theme.base.colors.textMuted};
	}
`;

const FeedsContainerWrapper = styled.div`
	height: 100%;
`;

const PaginationContainer = styled.div`
	margin-left: auto;
`;

const ResultsContainer = styled.div`
	margin-right: 10px;
`;

const FixedContentContainer = styled.div`
	margin-bottom: 5px;
`;

const Sorters = styled.div`
	display: flex;
	flex-direction: column;
`;

const TopOptions = styled.div`
	display: flex;
	flex-direction: row;
`;

const SortByContainer = styled.div`
	flex: 1 0 auto;
	display: flex;
	flex-direction: row;
	margin-top: 5px;
	font-size: 12px;
	> label {
		margin-right: 15px;
	}
`;

const PrefillNoticeContainer = styled.div`
	margin-bottom: 10px;
	display: flex;
	justify-content: space-between;
	align-items: center;
`;

const PrefillNotice = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	flex-grow: 2;
`;

const PrefillCloseButton = styled(Button)`
	color: #fff;
	padding: 0 5px;
	display: flex;
	align-items: center;
`;

const getCapiFieldsToShow = (isPreview: boolean) => {
	const defaultFieldsToShow = DEFAULT_PARAMS['show-fields']
		.split(',')
		.filter((f) => f !== 'scheduledPublicationDate')
		.join(',');

	if (!isPreview) {
		return defaultFieldsToShow;
	}

	return defaultFieldsToShow + ',scheduledPublicationDate';
};

const getParams = (
	query: string,
	{
		tags,
		sections,
		desks,
		ratings,
		toDate: to,
		fromDate: from,
	}: SearchInputState,
	isPreview: boolean,
	sortByParam: string,
) => ({
	q: query,
	tag: [...tags, ...desks].join(','),
	section: sections.join(','),
	'star-rating': ratings.join('|'),
	'to-date': to && to.format('YYYY-MM-DD'),
	'page-size': '20',
	'show-elements': 'image',
	'show-tags': 'all',
	'show-fields': getCapiFieldsToShow(isPreview),
	'show-atoms': 'media',
	'show-blocks': 'main',
	...(isPreview
		? { 'order-by': 'oldest', 'from-date': getTodayDate() }
		: {
				'order-by': 'newest',
				'order-date': sortByParam,
				'from-date': from && from.format('YYYY-MM-DD'),
			}),
});
class CapiSearchContainer extends React.Component<
	CapiSearchContainerProps,
	CapiSearchContainerState
> {
	public state = {
		capiFeedIndex: 0,
		displaySearchFilters: false,
		inputState: initState,
		displayPrevResults: false,
		sortByParam: 'published',
	};

	private interval: null | number = null;

	constructor(props: CapiSearchContainerProps) {
		super(props);
		this.debouncedRunSearchAndRestartPolling = debounce(
			() => this.runSearchAndRestartPolling(),
			750,
		);
	}

	public componentDidMount() {
		this.runSearchAndRestartPolling();
	}

	public componentWillUnmount() {
		this.stopPolling();
	}

	public handleParamsUpdate = (state: SearchInputState) => {
		this.setState(
			{
				inputState: state,
			},
			() => this.debouncedRunSearchAndRestartPolling(),
		);
	};

	public updateDisplaySearchFilters = (newValue: boolean) =>
		this.setState({
			displaySearchFilters: newValue,
		});

	public handleFeedClick = (index: number) =>
		this.setState(
			{
				capiFeedIndex: index,
			},
			this.runSearch,
		);

	public sortResultsBy = (event: React.ChangeEvent<HTMLSelectElement>) =>
		this.setState({ sortByParam: event.target.value }, this.runSearch);

	public get isLoading() {
		return (
			(this.state.capiFeedIndex === 0 && this.props.liveLoading) ||
			(this.state.capiFeedIndex === 1 && this.props.previewLoading)
		);
	}

	public get isLive() {
		return this.state.capiFeedIndex === 0;
	}

	public renderPrefillFixedContent = () => {
		return (
			<PrefillNoticeContainer>
				<PrefillNotice>
					<ContainerHeading>Suggested Articles</ContainerHeading>
					<PrefillCloseButton size="l" onClick={this.props.hidePrefills}>
						<ClearIcon size="xl" />
					</PrefillCloseButton>
				</PrefillNotice>
				<ClipboardHeader />
			</PrefillNoticeContainer>
		);
	};

	public renderSearchFixedContent = (displaySearchFilters: boolean) => {
		const pagination = this.getPagination();
		const hasPages = !!(pagination && pagination.totalPages > 1);
		return (
			<React.Fragment>
				<SearchInput
					updateDisplaySearchFilters={this.updateDisplaySearchFilters}
					displaySearchFilters={this.state.displaySearchFilters}
					onUpdate={this.handleParamsUpdate}
					showReviewSearch={false}
					rightHandContainer={<ClipboardHeader />}
				/>
				<FixedContentContainer>
					<SearchResultsHeadingContainer>
						<div>
							{displaySearchFilters ? (
								<SearchTitle>
									{'Results'}
									<ShortVerticalPinline />
								</SearchTitle>
							) : (
								<>
									<SearchTitle>
										{'Latest'}
										<ShortVerticalPinline />
									</SearchTitle>
									<RefreshButton
										disabled={this.isLoading}
										onClick={() => this.runSearchAndRestartPolling()}
									>
										{this.isLoading ? 'Loading' : 'Refresh'}
									</RefreshButton>
								</>
							)}
						</div>
						<Sorters>
							<TopOptions>
								<RadioGroup>
									<RadioButton
										checked={this.state.capiFeedIndex === 0}
										onChange={() => this.handleFeedClick(0)}
										label="Live"
										inline
										name="capiFeed"
									/>
									<RadioButton
										checked={this.state.capiFeedIndex === 1}
										onChange={() => this.handleFeedClick(1)}
										label="Draft"
										inline
										name="capiFeed"
									/>
								</RadioGroup>
								{pagination && hasPages && (
									<PaginationContainer>
										<Pagination
											pageChange={this.handlePageChange}
											currentPage={pagination.currentPage}
											totalPages={pagination.totalPages}
										/>
									</PaginationContainer>
								)}
							</TopOptions>
							<SortByContainer>
								<label htmlFor="sort-results">Sort by:</label>
								<select
									id="sort-results"
									onChange={this.sortResultsBy}
									value={this.state.sortByParam}
								>
									<option value="first-publication">First published</option>
									<option value="published">Latest published</option>
								</select>
							</SortByContainer>
						</Sorters>
					</SearchResultsHeadingContainer>
				</FixedContentContainer>
			</React.Fragment>
		);
	};

	public render() {
		const { isPrefillMode } = this.props;

		return (
			<FeedsContainerWrapper>
				<ScrollContainer
					fixed={
						isPrefillMode
							? this.renderPrefillFixedContent()
							: this.renderSearchFixedContent(this.state.displaySearchFilters)
					}
				>
					<ResultsContainer>
						<Feed isLive={this.isLive} />
					</ResultsContainer>
				</ScrollContainer>
			</FeedsContainerWrapper>
		);
	}

	private getPagination() {
		const { livePagination, previewPagination } = this.props;
		return this.isLive ? livePagination : previewPagination;
	}

	private handlePageChange = (page: number) => {
		if (page > 1) {
			this.runSearch(page);
			this.stopPolling();
		} else {
			this.runSearchAndRestartPolling();
		}
	};

	private runSearch(page: number = 1) {
		const { inputState } = this.state;
		const { capiFeedIndex } = this.state;
		const maybeArticleId = getIdFromURL(inputState.query);
		const searchTerm = maybeArticleId ? maybeArticleId : inputState.query;
		const isLive = capiFeedIndex === 0;
		const fetch = isLive ? this.props.fetchLive : this.props.fetchPreview;
		fetch(
			{
				...getParams(searchTerm, inputState, !isLive, this.state.sortByParam),
				page,
			},
			!!maybeArticleId,
		);
	}

	private runSearchAndRestartPolling() {
		this.stopPolling();
		this.interval = window.setInterval(
			() => this.runSearch(),
			feedArticlesPollInterval,
		);
		this.runSearch();
	}

	private stopPolling() {
		if (this.interval) {
			window.clearInterval(this.interval);
		}
	}

	private debouncedRunSearchAndRestartPolling = () => {};
}

const mapStateToProps = (state: State) => ({
	isPrefillMode: selectIsPrefillMode(state),
	liveLoading: liveSelectors.selectIsLoading(state),
	previewLoading: previewSelectors.selectIsLoading(state),
	prefillLoading: prefillSelectors.selectIsLoading(state),
	livePagination: liveSelectors.selectPagination(state),
	previewPagination: previewSelectors.selectPagination(state),
	prefillPagination: prefillSelectors.selectPagination(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
	fetchLive: (params: object, isResource: boolean) =>
		dispatch(fetchLive(params, isResource)),
	fetchPreview: (params: object, isResource: boolean) =>
		dispatch(fetchPreview(params, isResource)),
	hidePrefills: () => dispatch(hidePrefills()),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(CapiSearchContainer);
