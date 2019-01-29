import React from 'react';
import { styled } from 'constants/theme';
import ScrollContainer from '../ScrollContainer';
import TextInput from '../TextInput';
import CAPITagInput from '../FrontsCAPIInterface/TagInput';
import CAPIFieldFilter from '../FrontsCAPIInterface/FieldFilter';
import CAPIDateRangeInput from '../FrontsCAPIInterface/DateInput';
import moment from 'moment';
import FilterItem from './FilterItem';

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
  children: React.ReactNode;
  additionalFixedContent?: React.ComponentType<any>;
  displaySearchFilters: boolean;
  updateDisplaySearchFilters: (value: boolean) => void;
}

const InputContainer = styled('div')`
  margin-bottom: 20px;
  background: #ffffff;
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
  fromDate: null
} as SearchInputState;

class SearchInput extends React.Component<SearchInputProps, SearchInputState> {
  public state = initState;

  public onDateChange = (
    from: moment.Moment | null,
    to: moment.Moment | null
  ) => {
    this.setStateInner({ fromDate: from, toDate: to });
  };

  public clearInput = () => {
    this.setStateInner(initState);
    this.props.updateDisplaySearchFilters(false);
  };

  public searchInput = () => {
    this.props.updateDisplaySearchFilters(false);
  };

  public clearSelectedDates = () => {
    this.setStateInner({
      fromDate: null,
      toDate: null
    });
  };

  public handleSearchInput = ({
    currentTarget
  }: React.SyntheticEvent<HTMLInputElement>) => {
    this.setStateInner({
      query: currentTarget.value
    });
  };

  public handleDisplaySearchFilters = () => {
    this.props.updateDisplaySearchFilters(!this.props.displaySearchFilters);
  };

  public render() {
    const {
      children,
      displaySearchFilters,
      additionalFixedContent: AdditionalFixedContent
    } = this.props;

    const {
      query,
      tags,
      sections,
      desks,
      ratings,
      fromDate: from,
      toDate: to
    } = this.state;

    return (
      <ScrollContainer
        fixed={
          <React.Fragment>
            <InputContainer>
              <TextInput
                placeholder="Search content"
                value={query || ''}
                onChange={this.handleSearchInput}
                onClear={this.clearInput}
                onSearch={this.searchInput}
                searchTermsExist={this.searchTermsExist}
                onDisplaySearchFilters={this.handleDisplaySearchFilters}
              />
            </InputContainer>
            {tags.map(tag => (
              <FilterItem
                key={tag}
                onClear={() => this.removeStringFromStateKey('tags', tag)}
              >
                <span>{tag}</span>
              </FilterItem>
            ))}
            {sections.map(section => (
              <FilterItem
                key={section}
                onClear={() =>
                  this.removeStringFromStateKey('sections', section)
                }
              >
                <span>{section}</span>
              </FilterItem>
            ))}
            {desks.map(desk => (
              <FilterItem
                key={desk}
                onClear={() => this.removeStringFromStateKey('desks', desk)}
              >
                <span>{desk}</span>
              </FilterItem>
            ))}
            {ratings.map(rating => (
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
            {AdditionalFixedContent && <AdditionalFixedContent />}
          </React.Fragment>
        }
      >
        {!displaySearchFilters ? (
          children
        ) : (
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
            <CAPIFieldFilter
              placeholder="Select one or more"
              filterTitle="star rating for reviews"
              items={[
                { id: '1', label: '1 Star' },
                { id: '2', label: '2 Stars' },
                { id: '3', label: '3 Stars' },
                { id: '4', label: '4 Stars' },
                { id: '5', label: '5 Stars' }
              ]}
              onChange={this.addUniqueStringToStateKey('ratings')}
            />
            <CAPIDateRangeInput
              start={this.state.fromDate}
              end={this.state.toDate}
              onDateChange={this.onDateChange}
            />
          </>
        )}
      </ScrollContainer>
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
        [key]: arr.includes(id) ? arr : [...arr, id]
      });
    };
  }

  private removeStringFromStateKey(
    key: keyof StringArrSearchItems,
    val: string
  ) {
    const arr = this.state[key];
    this.setStateInner({
      ...this.state,
      [key]: arr.includes(val) ? arr.filter(v => v !== val) : arr
    });
  }

  private setStateInner<K extends keyof SearchInputState>(
    state: Pick<SearchInputState, K>
  ) {
    this.setState(state, () => {
      this.props.onUpdate(this.state);
    });
  }
}

export { SearchInputState, initState };

export default SearchInput;
