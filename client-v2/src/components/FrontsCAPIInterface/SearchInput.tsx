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
    tags: [] as string[],
    sections: [] as string[]
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
    this.setState({
      q: currentTarget.value
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

  public renderSelectedTags = (selectedTags: string[]) =>
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

  public render() {
    const {
      children,
      displaySearchFilters,
      additionalFixedContent: AdditionalFixedContent,
      isPreview
    } = this.props;

    const {
      q,
      selected: { tags, sections }
    } = this.state;

    const searchTermsExist = !!tags.length || !!sections.length || !!q;

    const allTags = tags.concat(sections);

    const dateParams = isPreview ? { 'order-by': 'oldest'} : { 'use-date': 'first-publication' };

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
              {this.renderSelectedTags(allTags)}
              {AdditionalFixedContent && <AdditionalFixedContent />}
            </React.Fragment>
          }
        >
          <SearchQuery
            params={{
              tag: tags.join(','),
              section: sections.join(','),
              q,
              'page-size': '20',
              'show-elements': 'image',
              'show-fields': 'internalPageCode,trailText',
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
      </React.Fragment>
    );
  }
}

export { AsyncState, CAPISearchQueryReponse };

export default FrontsCAPISearchInput;
