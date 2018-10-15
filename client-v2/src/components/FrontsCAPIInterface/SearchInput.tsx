import React from 'react';
import styled from 'styled-components';
import moreImage from 'shared/images/icons/more.svg';
import { SmallRoundButton, ClearButtonIcon } from 'util/sharedStyles/buttons';
import SearchQuery from '../CAPI/SearchQuery';
import ScrollContainer from '../ScrollContainer';
import TextInput from '../TextInput';
import CAPITagInput, { SearchTypes } from '../FrontsCAPIInterface/TagInput';

type FrontsCAPISearchInputProps = {
  children: any;
  additionalFixedContent?: React.ComponentType<any>;
  displaySearchFilters: boolean;
  updateDisplaySearchFilters: (value: boolean) => void;
};

type SearchTypeMap<T> = { [K in SearchTypes]: T };

type SearchTerms = SearchTypeMap<string>;
type SelectedTags = SearchTypeMap<string[]>;

type FrontsCAPISearchInputState = {
  q: string | void;
  searchTerms: SearchTerms;
  selected: SelectedTags;
};

const InputContainer = styled('div')`
  margin-bottom: 20px;
  background: #ffffff;
`;

const TagItem = styled('div')`
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
  sections: ''
};

const emptyState = {
  q: undefined,
  searchTerms: emptySearchTerms,
  selected: {
    tags: [] as Array<string>,
    sections: [] as Array<string>
  }
};

const reduceTypes = <V, O extends SearchTypeMap<V>, R>(
  obj: O,
  fn: (
    acc: R,
    key: Extract<keyof O, string>,
    val: O[Extract<keyof O, string>]
  ) => R,
  init: R
) => {
  let val = init;
  for (let key in obj) {
    val = fn(init, key, obj[key]);
  }
  return val;
};

const mapTypes = <V, O extends SearchTypeMap<V>, R>(
  obj: O,
  fn: (key: Extract<keyof O, string>, val: O[Extract<keyof O, string>]) => R
) => reduceTypes(obj, (acc, key, val) => [...acc, fn(key, val)], [] as R[]);

class FrontsCAPISearchInput extends React.Component<
  FrontsCAPISearchInputProps,
  FrontsCAPISearchInputState
> {
  state = emptyState;

  clearInput = () => {
    this.setState(emptyState);
    this.props.updateDisplaySearchFilters(false);
  };

  searchInput = () => {
    this.setState({
      searchTerms: emptySearchTerms
    });
    this.props.updateDisplaySearchFilters(false);
  };

  clearIndividualSearchTerm = (searchTerm: string) => {
    const selected = Object.entries(this.state.selected).reduce(
      (acc, [key, results]) => ({
        ...acc,
        [key]: results.filter(term => term !== searchTerm)
      }),
      {} as SelectedTags
    );
    this.setState({ selected });
  };

  handleSearchInput = ({
    currentTarget
  }: React.SyntheticEvent<HTMLInputElement>) => {
    this.setState({
      q: currentTarget.value
    });
  };

  handleTagSearchInput = (
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

  handleTypeInput = (item: any, type: SearchTypes) => {
    let newTags = [] as Array<string>;
    const oldTags = this.state.selected[type];
    if (item && oldTags.indexOf(item.id) === -1) {
      newTags = oldTags.concat([item.id]);
    }
    const newSearchTerms = { ...this.state.searchTerms, ...{ [type]: '' } };

    const newState = {
      [type]: newTags,
      searchTerms: newSearchTerms
    };

    this.setState({
      selected: {
        ...this.state.selected,
        [type]: newTags
      },
      searchTerms: newSearchTerms
    });
  };

  handleDisplaySearchFilters = () => {
    this.props.updateDisplaySearchFilters(!this.props.displaySearchFilters);
  };

  renderSelectedTags = (selectedTags: Array<string>) =>
    selectedTags.map(searchTerm => (
      <TagItem key={searchTerm}>
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
      </TagItem>
    ));

  render() {
    const {
      children,
      displaySearchFilters,
      additionalFixedContent: AdditionalFixedContent
    } = this.props;

    const searchTermsExist =
      mapTypes(this.state.selected, (_, results) => results.length).some(
        a => !!a
      ) || !!this.state.q;

    const allTags = reduceTypes(
      this.state.selected,
      (acc, _, tags) => [...acc, ...tags],
      [] as string[]
    );

    const filterParams = reduceTypes(
      this.state.selected,
      (acc, key, val) => ({
        ...acc,
        [key]: val.join(','),
      }),
      {} as SearchTypeMap<string>
    );

    if (!displaySearchFilters) {
      return (
        <ScrollContainer
          fixed={
            <React.Fragment>
              <InputContainer>
                <TextInput
                  placeholder="Search content"
                  value={this.state.q || ''}
                  onChange={this.handleSearchInput}
                  onClear={this.clearInput}
                  onSearch={this.searchInput}
                  onClearTag={this.clearIndividualSearchTerm}
                  searchTermsExist={searchTermsExist}
                  onDisplaySearchFilters={this.handleDisplaySearchFilters}
                />
              </InputContainer>
              {this.renderSelectedTags(allTags)}
              {AdditionalFixedContent && <AdditionalFixedContent />}
            </React.Fragment>
          }
        >
          <SearchQuery
            params={{
              ...filterParams,
              q: this.state.q,
              'page-size': '20',
              'use-date': 'first-publication',
              'show-elements': 'image',
              'show-fields': 'internalPageCode,trailText'
            }}
            poll={30000}
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
            // searchTerms={tags.concat(sections)} @todo -- is this used?
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
        {this.renderSelectedTags(allTags)}
        {mapTypes(this.state.searchTerms, (type, terms) => (
          <CAPITagInput
            placeholder="Type tag name"
            onSearchChange={this.handleTagSearchInput}
            tagsSearchTerm={terms}
            onChange={this.handleTypeInput}
            searchType={type}
          />
        ))}
      </React.Fragment>
    );
  }
}

export default FrontsCAPISearchInput;
