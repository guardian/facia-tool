import React from 'react';
import { styled } from 'constants/theme';
import TextInput from '../inputs/TextInput';
import CAPITagInput from './/TagInput';
import CAPIFieldFilter from './/FieldFilter';
import CAPIDateRangeInput from './/DateInput';
import moment from 'moment';
import FilterItem from './FilterItem';
import ButtonDefault from 'components/inputs/ButtonDefault';

interface StringArrSearchItems {
	tags: string[];
	sections: string[];
	desks: string[];
	ratings: string[];
}

type SearchInputState = StringArrSearchItems & {
	query: string;
	fromDate: null | moment.Moment;
	toDate: null | moment.Moment;
};

interface SearchInputProps {
	onUpdate: (state: SearchInputState) => void;
	displaySearchFilters: boolean;
	updateDisplaySearchFilters: (value: boolean) => void;
	showReviewSearch: boolean;
	rightHandContainer?: React.ReactElement<any>;
}

const TextInputContainer = styled.div`
	flex-grow: 2;
`;

const InputContainer = styled.div`
	margin-bottom: 10px;
	display: flex;
	justify-content: space-between;
`;

const CloseButton = styled(ButtonDefault)`
	margin: 10px 0;
`;

const renderDateAsString = (date: moment.Moment | null) => {
	if (!date) {
		return 'Not selected';
	}
	return date.format('DD/MM/YYYY');
};

const initState = {
	tags: [],
	sections: [],
	desks: [],
	ratings: [],
	query: '',
	toDate: null,
	fromDate: null,
} as SearchInputState;

class SearchInput extends React.Component<SearchInputProps, SearchInputState> {
	public state = initState;

	public onDateChange = (
		from: moment.Moment | null,
		to: moment.Moment | null,
	) => {
		this.setStateInner({ fromDate: from, toDate: to });
	};

	public clearInput = () => {
		this.setStateInner(initState);
		this.props.updateDisplaySearchFilters(false);
	};

	public hideSearchFilters = () => {
		this.props.updateDisplaySearchFilters(false);
	};

	public showSearchFilters = () => {
		this.props.updateDisplaySearchFilters(true);
	};

	public clearSelectedDates = () => {
		this.setStateInner({
			fromDate: null,
			toDate: null,
		});
	};

	public handleSearchInput = ({
		currentTarget,
	}: React.SyntheticEvent<HTMLInputElement>) => {
		this.setStateInner({
			query: currentTarget.value,
		});
	};

	public handleDisplaySearchFilters = () => {
		this.props.updateDisplaySearchFilters(!this.props.displaySearchFilters);
	};

	public render() {
		const { displaySearchFilters, rightHandContainer } = this.props;

		const {
			query,
			tags,
			sections,
			desks,
			ratings,
			fromDate: from,
			toDate: to,
		} = this.state;

		return (
			<React.Fragment>
				<InputContainer>
					<TextInputContainer>
						<TextInput
							placeholder="Search content"
							value={query || ''}
							onClick={this.showSearchFilters}
							onChange={this.handleSearchInput}
							onClear={this.clearInput}
							onSearch={this.hideSearchFilters}
							searchTermsExist={this.searchTermsExist}
							displaySearchIcon={!!this.handleDisplaySearchFilters}
							onKeyUp={(e) => {
								if (e.keyCode === 13) {
									this.hideSearchFilters();
								}
							}}
						/>
					</TextInputContainer>
					{rightHandContainer}
				</InputContainer>
				{tags.map((tag) => (
					<FilterItem
						key={tag}
						onClear={() => this.removeStringFromStateKey('tags', tag)}
					>
						<span>{tag}</span>
					</FilterItem>
				))}
				{sections.map((section) => (
					<FilterItem
						key={section}
						onClear={() => this.removeStringFromStateKey('sections', section)}
					>
						<span>{section}</span>
					</FilterItem>
				))}
				{desks.map((desk) => (
					<FilterItem
						key={desk}
						onClear={() => this.removeStringFromStateKey('desks', desk)}
					>
						<span>{desk}</span>
					</FilterItem>
				))}
				{ratings.map((rating) => (
					<FilterItem
						key={rating}
						onClear={() => this.removeStringFromStateKey('ratings', rating)}
					>
						<span>{rating}</span>
					</FilterItem>
				))}
				{this.shouldShowDate && (
					<FilterItem onClear={() => this.clearSelectedDates()}>
						<span>From: {renderDateAsString(from)} </span>
						<span>To: {renderDateAsString(to)} </span>
					</FilterItem>
				)}
				{displaySearchFilters && (
					<>
						<CAPITagInput
							placeholder={`Type tag name`}
							onSelect={this.addUniqueStringToStateKey('tags')}
							searchType="tags"
						/>
						<CAPITagInput
							placeholder={`Type section name`}
							onSelect={this.addUniqueStringToStateKey('sections')}
							searchType="sections"
						/>

						<CAPITagInput
							placeholder={`Type commissioning desk name`}
							onSelect={this.addUniqueStringToStateKey('desks')}
							searchType="desks"
						/>
						{this.props.showReviewSearch && (
							<CAPIFieldFilter
								placeholder="Select one or more"
								filterTitle="star rating for reviews"
								items={[
									{ id: '1', label: '1 Star' },
									{ id: '2', label: '2 Stars' },
									{ id: '3', label: '3 Stars' },
									{ id: '4', label: '4 Stars' },
									{ id: '5', label: '5 Stars' },
								]}
								onChange={this.addUniqueStringToStateKey('ratings')}
							/>
						)}
						<CAPIDateRangeInput
							start={this.state.fromDate}
							end={this.state.toDate}
							onDateChange={this.onDateChange}
						/>
						<CloseButton onClick={this.hideSearchFilters}>Close</CloseButton>
					</>
				)}
			</React.Fragment>
		);
	}

	private get searchTermsExist() {
		return (
			!!this.state.tags.length ||
			!!this.state.sections.length ||
			!!this.state.desks.length ||
			!!this.state.ratings.length ||
			!!this.state.query ||
			!!this.state.fromDate ||
			!!this.state.toDate
		);
	}

	private get shouldShowDate() {
		return this.state.fromDate || this.state.toDate;
	}

	private addUniqueStringToStateKey(key: keyof StringArrSearchItems) {
		return ({ id }: { id: string }) => {
			const arr = this.state[key];
			this.setStateInner({
				...this.state,
				[key]: arr.includes(id) ? arr : [...arr, id],
			});
		};
	}

	private removeStringFromStateKey(
		key: keyof StringArrSearchItems,
		val: string,
	) {
		const arr = this.state[key];
		this.setStateInner({
			...this.state,
			[key]: arr.includes(val) ? arr.filter((v) => v !== val) : arr,
		});
	}

	private setStateInner<K extends keyof SearchInputState>(
		state: Pick<SearchInputState, K>,
	) {
		this.setState(state, () => {
			this.props.onUpdate(this.state);
		});
	}
}

export { SearchInputState, initState };

export default SearchInput;
