// @flow

import * as React from 'react';
import styled from 'styled-components';

import SearchQuery from '../CAPI/SearchQuery';
import ScrollContainer from '../ScrollContainer';
import TextInput from '../TextInput';
import CAPITagInput from '../FrontsCAPIInterface/TagInput';

type FrontsCAPISearchInputProps = {
  children: *,
  additionalFixedContent?: React.ComponentType<any>,
  displaySearchFilters: boolean
};

type FrontsCAPISearchInputState = {
  q: ?string,
  tags: Array<string>,
  sections: Array<string>,
  dislaySearchFilters: boolean
};

const InputContainer = styled('div')`
  margin-bottom: 20px;
`;

class FrontsCAPISearchInput extends React.Component<
  FrontsCAPISearchInputProps,
  FrontsCAPISearchInputState
> {
  state = {
    q: null,
    tags: [],
    sections: [],
    displaySearchFilters: true,
    tagSearchTerm: ''
  };

  clearInput = () => {
    this.setState({
      q: '',
      tags: [],
      sections: [],
      displaySearchFilters: false
    });
  };

  clearIndividualSearchTerm = (
    type: 'tags' | 'sections',
    searchTerm: string
  ) => {
    const oldTerms = this.state[type];
    const newTerms = oldTerms.filter(term => term !== searchTerm);
    this.setState({ [type]: newTerms });
  };

  handleSearchInput = ({ currentTarget }: SyntheticEvent<HTMLInputElement>) => {
    this.setState({
      q: currentTarget.value
    });
  };

  handleTagSearchInput = ({ currentTarget }: SyntheticEvent<HTMLInputElement>) => {
    this.setState({
      tagSearchTerm: currentTarget.value
    });
  };

  handleTagInput = (item: any) => {
    const newTags = this.state.tags;
    if (item) {
      newTags.push(item.id);
    }
    this.setState({
      tags: newTags,
      tagSearchTerm: ''
    });
  };

  handleSectionInput = (item: any) => {
    this.setState({
      sections: item ? item.id : []
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
    const { tags, sections, q, displaySearchFilters, tagSearchTerm } = this.state;

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
          <CAPITagInput onSearchChange={this.handleTagSearchInput} tagSearchTerm={tagSearchTerm} onChange={this.handleTagInput} />
        )}
      </ScrollContainer>
    );
  }
}

export default FrontsCAPISearchInput;
