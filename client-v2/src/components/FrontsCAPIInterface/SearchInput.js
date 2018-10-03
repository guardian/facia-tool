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
  tagsSearchTerm: '',
  sectionsSearchTerm: ''
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

const emptyState = {
  q: null,
  tags: [],
  sections: [],
  tagsSearchTerm: '',
  sectionsSearchTerm: ''
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
      tagsSearchTerm: '',
      sectionsSearchTerm: ''
    });
    this.props.updateDisplaySearchFilters(false);
  };

  searchInput = () => {
    this.setState({
      tagsSearchTerm: '',
      sectionsSearchTerm: ''
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
    const termInState = `${type}SearchTerm`;
    this.setState({
      [termInState]: currentTarget.value
    });
  };

  handleTagInput = (item: any, type: string) => {
    const searchTerm = `${type}SearchTerm`;
    let newTags;
    const oldTags = this.state[type];
    if (item && oldTags.indexOf(item.id) === -1) {
      newTags = oldTags.concat([item.id]);
    }
    this.setState({
      [type]: newTags,
      [searchTerm]: ''
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

    const {
      tags,
      sections,
      q,
      tagsSearchTerm,
      sectionsSearchTerm
    } = this.state;

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
          {!displaySearchFilters && (
            <SearchQuery
              params={{
                tag: tagQuery,
                section: sectionQuery,
                q,
                'show-elements': 'image',
                'show-fields': 'internalPageCode,trailText'
              }}
              poll={30000}
            >
              {children}
            </SearchQuery>
          )}
        </ScrollContainer>
      );
    }
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
          tagsSearchTerm={tagsSearchTerm}
          onChange={this.handleTagInput}
          searchType="tags"
        />
        <CAPITagInput
          placeholder="Type section name"
          onSearchChange={this.handleTagSearchInput}
          tagsSearchTerm={sectionsSearchTerm}
          onChange={this.handleTagInput}
          searchType="sections"
        />
      </React.Fragment>
    );
  }
}

export default FrontsCAPISearchInput;
