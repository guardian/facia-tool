// @flow

import * as React from 'react';
import styled from 'styled-components';

import SearchQuery from '../CAPI/SearchQuery';
import ScrollContainer from '../ScrollContainer';
import TextInput from '../TextInput';
import CAPITagInput from '../FrontsCAPIInterface/TagInput';

type FrontsCAPISearchInputProps = {
  children: *,
  additionalFixedContent?: React.ComponentType<any>
};

type FrontsCAPISearchInputState = {
  q: ?string,
  tags: Array<string>,
  sections: Array<string>,
  dislaySearchFilters: boolean,
  tagsSearchTerm: '',
  sectionsSearchTerm: ''
};

const InputContainer = styled('div')`
  margin-bottom: 20px;
`;

const emptyState = {
  q: null,
  tags: [],
  sections: [],
  displaySearchFilters: true,
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
      displaySearchFilters: true,
      tagsSearchTerm: '',
      sectionsSearchTerm: ''
    });
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
    const newTags = this.state[type];
    if (item && newTags.indexOf(item.id) === -1) {
      newTags.push(item.id);
    }
    this.setState({
      [type]: newTags,
      [searchTerm]: ''
    });
  };

  handleDisplaySearchFilters = () => {
    this.setState({
      displaySearchFilters: !this.state.displaySearchFilters
    });
  };

  render() {
    const {
      children,
      additionalFixedContent: AdditionalFixedContent
    } = this.props;
    const {
      tags,
      sections,
      q,
      displaySearchFilters,
      tagsSearchTerm,
      sectionsSearchTerm
    } = this.state;

    const displayClear = !!tags || !!sections || !!q;
    const tagQuery = tags ? tags.join(',') : '';
    const sectionQuery = sections ? sections.join(',') : '';

    return (
      <ScrollContainer
        fixed={
          <React.Fragment>
            <InputContainer>
              <TextInput
                searchTerms={tags.concat(sections)}
                placeholder="Search"
                value={this.state.q || ''}
                onChange={this.handleSearchInput}
                onClear={this.clearInput}
                onClearTag={this.clearIndividualSearchTerm}
                displayClear={displayClear}
                onDisplaySearchFilters={this.handleDisplaySearchFilters}
              />
            </InputContainer>
            {AdditionalFixedContent && <AdditionalFixedContent />}
          </React.Fragment>
        }
      >
        {!displaySearchFilters && (
          <SearchQuery
            params={{
              tagQuery,
              sectionQuery,
              q,
              'show-elements': 'image',
              'show-fields': 'internalPageCode,trailText'
            }}
            poll={30000}
          >
            {children}
          </SearchQuery>
        )}
        {displaySearchFilters && (
          <React.Fragment>
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
        )}
      </ScrollContainer>
    );
  }
}

export default FrontsCAPISearchInput;
