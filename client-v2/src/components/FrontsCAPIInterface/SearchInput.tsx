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
  fetchFeed: (q: string, liveParams: object, previewParams: object) => void;
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
  from: null | moment.Moment;
  to: null | moment.Moment;
};

const getParams = (
  {
    tags,
    sections,
    desks,
    ratings,
    query,
    to,
    from
  }: FrontsCAPISearchInputState,
  isPreview: boolean
) => ({
  q: query,
  tag: [...tags, ...desks].join(','),
  section: sections.join(','),
  'star-rating': ratings.map(rating => rating.slice(0, 1)).join('|'),
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
  to: null,
  from: null
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
    this.setStateAndRunSearch({ from, to });
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
      from: null,
      to: null
    });
  };

  public handleSearchInput = ({
    currentTarget
  }: React.SyntheticEvent<HTMLInputElement>) => {
    const targetValue = currentTarget.value;
    const maybeArticleId = getIdFromURL(targetValue);
    const searchTerm = maybeArticleId ? maybeArticleId : targetValue;

    this.setStateAndRunSearch({
      query: searchTerm
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

    const { query, tags, sections, desks, ratings, from, to } = this.state;

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
              placeholder={'Select one or more'}
              filterTitle="star rating for reviews"
              items={[
                { value: '1', id: '1 Star' },
                { value: '2', id: '2 Stars' },
                { value: '3', id: '3 Stars' },
                { value: '4', id: '4 Stars' },
                { value: '5', id: '5 Stars' }
              ]}
              onChange={this.addUniqueStringToStateKey('ratings')}
            />
            <CAPIDateRangeInput
              start={this.state.from}
              end={this.state.to}
              onDateChange={this.onDateChange}
            />
          </>
        )}
      </ScrollContainer>
    );
  }

  private runSearch() {
    this.props.fetchFeed(
      this.state.query,
      getParams(this.state, false),
      getParams(this.state, true)
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
      !!this.state.from ||
      !!this.state.to
    );
  }

  private get shouldShowDate() {
    return this.state.from || this.state.to;
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
  fetchFeed: (query: string, liveParams: object, previewParams: object) => {
    const maybeArticleId = getIdFromURL(query);
    dispatch(fetchLive(liveParams, !!maybeArticleId));
    dispatch(fetchPreview(previewParams, !!maybeArticleId));
  }
});

export default connect(
  null,
  mapDispatchToProps
)(FrontsCAPISearchInput);
