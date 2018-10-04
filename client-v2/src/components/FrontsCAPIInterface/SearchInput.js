// @flow

import * as React from 'react';
import styled from 'styled-components';
import moreImage from 'shared/images/icons/more.svg';
import { SmallRoundButton, ClearButtonIcon } from 'util/sharedStyles/buttons';
import SearchQuery from '../CAPI/SearchQuery';
import ScrollContainer from '../ScrollContainer';
import TextInput from '../TextInput';
import CAPITagInput from '../FrontsCAPIInterface/TagInput';

type FrontsCAPISearchInputProps = {
  children: *,
  additionalFixedContent?: React.ComponentType<any>,
  displaySearchFilters: boolean,
  updateDisplaySearchFilters: (value: boolean) => void
};

type FrontsCAPISearchInputState = {
  q: ?string,
  tags: Array<string>,
  sections: Array<string>,
  searchTerms: {
    tags: string,
    sections: string
  }
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
  q: null,
  tags: [],
  sections: [],
  searchTerms: emptySearchTerms
};

class FrontsCAPISearchInput extends React.Component<
  FrontsCAPISearchInputProps,
  FrontsCAPISearchInputState
> {
  state = emptyState;

  clearInput = () => {
    this.setState({
      q: null,
      tags: [],
      sections: [],
      searchTerms: emptySearchTerms
    });
    this.props.updateDisplaySearchFilters(false);
  };

  searchInput = () => {
    this.setState({
      searchTerms: emptySearchTerms
    });
    this.props.updateDisplaySearchFilters(false);
  };

  clearIndividualSearchTerm = (searchTerm: string) => {
    const oldTags = this.state.tags;
    const newTags = oldTags.filter(term => term !== searchTerm);
    const oldSections = this.state.sections;
    const newSections = oldSections.filter(term => term !== searchTerm);
    this.setState({ tags: newTags, sections: newSections });
  };

  handleSearchInput = ({ currentTarget }: SyntheticEvent<HTMLInputElement>) => {
    this.setState({
      q: currentTarget.value
    });
  };

  handleTagSearchInput = (
    { currentTarget }: SyntheticEvent<HTMLInputElement>,
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

  handleTagInput = (item: any, type: string) => {
    let newTags;
    const oldTags = this.state[type];
    if (item && oldTags.indexOf(item.id) === -1) {
      newTags = oldTags.concat([item.id]);
    }
    const newSearchTerms = { ...this.state.searchTerms, ...{ [type]: '' } };
    this.setState({
      [type]: newTags,
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

    const { tags, sections, q, searchTerms } = this.state;

    const searchTermsExist = tags.length !== 0 || sections.length !== 0 || !!q;
    const tagQuery = tags ? tags.join(',') : '';
    const sectionQuery = sections ? sections.join(',') : '';

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
              {this.renderSelectedTags(tags.concat(sections))}
              {AdditionalFixedContent && <AdditionalFixedContent />}
            </React.Fragment>
          }
        >
          <SearchQuery
            params={{
              tag: tagQuery,
              section: sectionQuery,
              q,
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

    const tagType = 'tags';
    const sectionType = 'sections';
    return (
      <React.Fragment>
        <InputContainer>
          <TextInput
            searchTerms={tags.concat(sections)}
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
        {this.renderSelectedTags(tags.concat(sections))}
        <CAPITagInput
          placeholder="Type tag name"
          onSearchChange={this.handleTagSearchInput}
          tagsSearchTerm={searchTerms[tagType]}
          onChange={this.handleTagInput}
          searchType={tagType}
        />
        <CAPITagInput
          placeholder="Type section name"
          onSearchChange={this.handleTagSearchInput}
          tagsSearchTerm={searchTerms[sectionType]}
          onChange={this.handleTagInput}
          searchType={sectionType}
        />
      </React.Fragment>
    );
  }
}

export default FrontsCAPISearchInput;
