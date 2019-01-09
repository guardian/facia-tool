import React from 'react';
import styled from 'styled-components';
import ScrollContainer from '../ScrollContainer';
import TextInput from '../TextInput';
import CAPITagInput, { SearchTypes } from '../FrontsCAPIInterface/TagInput';
import CAPIFieldFilter from '../FrontsCAPIInterface/FieldFilter';
import CAPIDateRangeInput from '../FrontsCAPIInterface/DateInput';
import { getIdFromURL } from 'util/CAPIUtils';
import { getTodayDate } from 'util/getTodayDate';
import moment from 'moment';
import { fetchLive, fetchPreview } from 'bundles/capiFeedBundle';
import { Dispatch } from 'types/Store';
import { connect } from 'react-redux';
import FilterItem from './FilterItem';
import debounce from 'lodash/debounce';

interface FrontsCAPISearchInputProps {
  children: any;
  additionalFixedContent?: React.ComponentType<any>;
  displaySearchFilters: boolean;
  updateDisplaySearchFilters: (value: boolean) => void;
  isPreview: boolean;
  fetchFeed: (
    liveParams: object,
    previewParams: object,
    isResource: boolean
  ) => void;
}

const InputContainer = styled('div')`
  margin-bottom: 20px;
  background: #ffffff;
`;

interface StringArrSearchItems {
  tags: string[];
  sections: string[];
  desks: string[];
  ratings: string[];
}

type FrontsCAPISearchInputState = StringArrSearchItems & {
  query: string;
  fromDate: null | moment.Moment;
  toDate: null | moment.Moment;
};

const getParams = (
  query: string,
  {
    tags,
    sections,
    desks,
    ratings,
    toDate: to,
    fromDate: from
  }: FrontsCAPISearchInputState,
  isPreview: boolean
) => ({
  q: query,
  tag: [...tags, ...desks].join(','),
  section: sections.join(','),
  'star-rating': ratings.join('|'),
  'from-date': from && from.format('YYYY-MM-DD'),
  'to-date': to && to.format('YYYY-MM-DD'),
  'page-size': '20',
  'show-elements': 'image',
  'show-fields': 'internalPageCode,trailText,firstPublicationDate,isLive',
  ...(isPreview
    ? { 'order-by': 'oldest', 'from-date': getTodayDate() }
    : { 'order-by': 'newest', 'order-date': 'first-publication' })
});

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
} as FrontsCAPISearchInputState;

class FrontsCAPISearchInput extends React.Component<
  FrontsCAPISearchInputProps,
  FrontsCAPISearchInputState
> {
  public state = initState;
  private interval: null | number = null;

  constructor(props: FrontsCAPISearchInputProps) {
    super(props);
    this.debouncedRunSearchAndRestartPolling = debounce(
      () => this.runSearchAndRestartPolling(),
      250
    );
  }

  public componentDidMount() {
    this.runSearchAndRestartPolling();
  }

  public componentWillUnmount() {
    this.stopPolling();
  }

  public onDateChange = (
    from: moment.Moment | null,
    to: moment.Moment | null
  ) => {
    this.setStateAndRunSearch({ fromDate: from, toDate: to });
  };

  public clearInput = () => {
    this.setStateAndRunSearch(initState);
    this.props.updateDisplaySearchFilters(false);
  };

  public searchInput = () => {
    this.props.updateDisplaySearchFilters(false);
  };

  public clearSelectedDates = () => {
    this.setStateAndRunSearch({
      fromDate: null,
      toDate: null
    });
  };

  public handleSearchInput = ({
    currentTarget
  }: React.SyntheticEvent<HTMLInputElement>) => {
    this.setStateAndRunSearch({
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

  private runSearch() {
    const { query } = this.state;
    const maybeArticleId = getIdFromURL(query);
    const searchTerm = maybeArticleId ? maybeArticleId : query;
    this.props.fetchFeed(
      getParams(searchTerm, this.state, false),
      getParams(searchTerm, this.state, true),
      !!maybeArticleId
    );
  }

  private runSearchAndRestartPolling() {
    this.stopPolling();
    this.interval = window.setInterval(() => this.runSearch(), 30000);
    this.runSearch();
  }

  private stopPolling() {
    if (this.interval) {
      window.clearInterval(this.interval);
    }
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
      this.setStateAndRunSearch({
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
    this.setStateAndRunSearch({
      ...this.state,
      [key]: arr.includes(val) ? arr.filter(v => v !== val) : arr
    });
  }

  private debouncedRunSearchAndRestartPolling = () => {};

  private setStateAndRunSearch<K extends keyof FrontsCAPISearchInputState>(
    state: Pick<FrontsCAPISearchInputState, K>
  ) {
    this.setState(state, () => {
      this.debouncedRunSearchAndRestartPolling();
    });
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchFeed: (
    liveParams: object,
    previewParams: object,
    isResource: boolean
  ) => {
    dispatch(fetchLive(liveParams, isResource));
    dispatch(fetchPreview(previewParams, isResource));
  }
});

export default connect(
  null,
  mapDispatchToProps
)(FrontsCAPISearchInput);
