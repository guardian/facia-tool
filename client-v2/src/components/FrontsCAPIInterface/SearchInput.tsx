import React from 'react';
import styled from 'styled-components';
import moreImage from 'shared/images/icons/more.svg';
import { SmallRoundButton, ClearButtonIcon } from 'util/sharedStyles/buttons';
import SearchQuery, { CAPISearchQueryReponse } from '../CAPI/SearchQuery';
import ScrollContainer from '../ScrollContainer';
import TextInput from '../TextInput';
import CAPITagInput, {
  SearchTypes,
  AsyncState
} from '../FrontsCAPIInterface/TagInput';
import CAPIFieldFilter, {
  FilterTypes
} from '../FrontsCAPIInterface/FieldFilter';
import { getIdFromURL } from 'util/CAPIUtils';
import { getTodayDate } from 'util/getTodayDate';

interface FrontsCAPISearchInputProps {
  children: any;
  additionalFixedContent?: React.ComponentType<any>;
  displaySearchFilters: boolean;
  updateDisplaySearchFilters: (value: boolean) => void;
  isPreview: boolean;
}

type SearchTypeMap<T> = { [K in SearchTypes]: T };

type SearchTerms = SearchTypeMap<string>;
type SelectedTags = SearchTypeMap<string[]>;

interface FrontsCAPISearchInputState {
  q: string | void;
  searchTerms: SearchTerms;
  selected: SelectedTags;
}

const InputContainer = styled('div')`
  margin-bottom: 20px;
  background: #ffffff;
`;

const SearchTermItem = styled('div')`
  color: #121212;
  font-weight: bold;
  border: solid 1px #c4c4c4;
  font-size: 14px;
  background-color: #ffffff;
  padding: 7px 15px 7px 15px;
  margin-bottom: 10px;
  :hover {
    color: #c4c4c4;
  }
`;

const emptySearchTerms = {
  tags: '',
  sections: '',
  desks: '',
  ratings: ''
};

const emptyState = {
  q: undefined,
  searchTerms: emptySearchTerms,
  selected: {
    tags: [] as string[],
    sections: [] as string[],
    desks: [] as string[],
    ratings: [] as string[]
  }
};

class FrontsCAPISearchInput extends React.Component<
  FrontsCAPISearchInputProps,
  FrontsCAPISearchInputState
> {
  public state = emptyState;

  public clearInput = () => {
    this.setState(emptyState);
    this.props.updateDisplaySearchFilters(false);
  };

  public searchInput = () => {
    this.setState({
      searchTerms: emptySearchTerms
    });
    this.props.updateDisplaySearchFilters(false);
  };

  public clearIndividualSearchTerm = (searchTerm: string) => {
    const selected = Object.entries(this.state.selected).reduce(
      (acc, [key, results]) => ({
        ...acc,
        [key]: results.filter(term => term !== searchTerm)
      }),
      {} as SelectedTags
    );
    this.setState({ selected });
  };

  public handleSearchInput = ({
    currentTarget
  }: React.SyntheticEvent<HTMLInputElement>) => {
    const targetValue = currentTarget.value;

    const maybeArticleId = getIdFromURL(targetValue);

    const searchTerm = maybeArticleId ? maybeArticleId : targetValue;

    this.setState({
      q: searchTerm
    });
  };

  public handleTagSearchInput = (
    { currentTarget }: React.SyntheticEvent<HTMLInputElement>,
    type: string
  ) => {
    const newSearchTerms = {
      ...this.state.searchTerms,
      ...{ [type]: currentTarget.value }
    };
    this.setState({
      searchTerms: newSearchTerms
    });
  };

  public handleDropdownInput = (item: any, type: FilterTypes) => {
    let newFilterFields = [] as string[];
    const oldFilterFields = this.state.selected[type];

    if (item && oldFilterFields.indexOf(item.id) === -1) {
      newFilterFields = oldFilterFields.concat([item.id]);
    }
    this.setState({
      selected: {
        ...this.state.selected,
        [type]: newFilterFields
      }
    });
  };

  public handleTypeInput = (item: any, type: SearchTypes) => {
    let newTags = [] as string[];
    const oldTags = this.state.selected[type];

    if (item && oldTags.indexOf(item.id) === -1) {
      newTags = oldTags.concat([item.id]);
    }
    const newSearchTerms = { ...this.state.searchTerms, ...{ [type]: '' } };

    this.setState({
      selected: {
        ...this.state.selected,
        [type]: newTags
      },
      searchTerms: newSearchTerms
    });
  };

  public handleDisplaySearchFilters = () => {
    this.props.updateDisplaySearchFilters(!this.props.displaySearchFilters);
  };

  public renderSelectedSearchTerms = (selectedSearchTerms: string[]) =>
    selectedSearchTerms.map(searchTerm => (
      <SearchTermItem key={searchTerm}>
        <span>{searchTerm}</span>
        <SmallRoundButton
          onClick={() => this.clearIndividualSearchTerm(searchTerm)}
          title="Clear search"
        >
          <ClearButtonIcon
            src={moreImage}
            onClick={() => this.clearIndividualSearchTerm(searchTerm)}
            alt=""
            height="22px"
            width="22px"
          />
        </SmallRoundButton>
      </SearchTermItem>
    ));

  public render() {
    const {
      children,
      displaySearchFilters,
      additionalFixedContent: AdditionalFixedContent,
      isPreview
    } = this.props;

    const {
      q,
      selected: { tags, sections, desks, ratings }
    } = this.state;

    const searchTermsExist =
      !!tags.length ||
      !!sections.length ||
      !!desks.length ||
      !!ratings.length ||
      !!q;

    const allSearchTerms = tags.concat(sections, desks, ratings);

    const searchTags =
      tags.length && desks.length
        ? tags.join(',') + ',' + desks.join(',')
        : desks.length && !tags.length
          ? desks.join(',')
          : tags.join(',');

    const dateParams = isPreview
      ? { 'order-by': 'oldest', 'from-date': getTodayDate() }
      : { 'order-by': 'newest', 'order-date': 'first-publication' };

    if (!displaySearchFilters) {
      return (
        <ScrollContainer
          fixed={
            <React.Fragment>
              <InputContainer>
                <TextInput
                  placeholder="Search content"
                  value={q || ''}
                  onChange={this.handleSearchInput}
                  onClear={this.clearInput}
                  onSearch={this.searchInput}
                  onClearTag={this.clearIndividualSearchTerm}
                  searchTermsExist={searchTermsExist}
                  onDisplaySearchFilters={this.handleDisplaySearchFilters}
                />
              </InputContainer>
              {this.renderSelectedSearchTerms(allSearchTerms)}
              {AdditionalFixedContent && <AdditionalFixedContent />}
            </React.Fragment>
          }
        >
          <SearchQuery
            params={{
              tag: searchTags,
              section: sections.join(','),
              'star-rating': ratings
                .map(rating => rating.slice(0, 1))
                .join('|'),
              q,
              'page-size': '20',
              'show-elements': 'image',
              'show-fields':
                'internalPageCode,trailText,firstPublicationDate,isLive',
              ...dateParams
            }}
            poll={30000}
            isPreview={isPreview}
          >
            {children}
          </SearchQuery>
        </ScrollContainer>
      );
    }

    return (
      <React.Fragment>
        <InputContainer>
          <TextInput
            placeholder={searchTermsExist ? '' : 'Search content'}
            value={this.state.q || ''}
            onChange={this.handleSearchInput}
            onClear={this.clearInput}
            onSearch={this.searchInput}
            onClearTag={this.clearIndividualSearchTerm}
            searchTermsExist={searchTermsExist}
            onDisplaySearchFilters={this.handleDisplaySearchFilters}
          />
        </InputContainer>
        {this.renderSelectedSearchTerms(allSearchTerms)}
        <CAPITagInput
          placeholder={`Type tag name`}
          onSearchChange={this.handleTagSearchInput}
          tagsSearchTerm={this.state.searchTerms.tags}
          onChange={this.handleTypeInput}
          searchType="tags"
        />
        <CAPITagInput
          placeholder={`Type section name`}
          onSearchChange={this.handleTagSearchInput}
          tagsSearchTerm={this.state.searchTerms.sections}
          onChange={this.handleTypeInput}
          searchType="sections"
        />
        <CAPITagInput
          placeholder={`Type commissioning desk name`}
          onSearchChange={this.handleTagSearchInput}
          tagsSearchTerm={this.state.searchTerms.desks}
          onChange={this.handleTypeInput}
          searchType="desks"
        />
        <CAPIFieldFilter
          placeholder={'Select one or more'}
          filterTitle="star rating for reviews"
          filterType="ratings"
          items={[
            { value: '1', id: '1 Star' },
            { value: '2', id: '2 Stars' },
            { value: '3', id: '3 Stars' },
            { value: '4', id: '4 Stars' },
            { value: '5', id: '5 Stars' }
          ]}
          onChange={this.handleDropdownInput}
        />
      </React.Fragment>
    );
  }
}

export { AsyncState, CAPISearchQueryReponse };

export default FrontsCAPISearchInput;
