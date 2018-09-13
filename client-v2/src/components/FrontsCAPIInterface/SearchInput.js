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
  tag: ?string,
  section: ?string,
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
    tag: null,
    section: null,
    displaySearchFilters: false
  };

  clearInput = () => {
    this.setState({
      q: '',
      tag: null,
      section: null,
      displaySearchFilters: false
    });
  };

  handleSearchInput = ({ currentTarget }: SyntheticEvent<HTMLInputElement>) => {
    this.setState({
      q: currentTarget.value
    });
  };

  handleTagInput = (item: any) => {
    this.setState({
      tag: item ? item.id : null
    });
  };

  handleSectionInput = (item: any) => {
    this.setState({
      section: item ? item.id : null
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
    const { tag, section, q, displaySearchFilters } = this.state;

    const displayClear = !!tag || !!section || !!q;

    return (
      <ScrollContainer
        fixed={
          <React.Fragment>
            <InputContainer>
              <TextInput
                placeholder="Search"
                value={this.state.q || ''}
                onChange={this.handleSearchInput}
                onClear={this.clearInput}
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
              tag,
              section,
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
          <CAPITagInput onChange={this.handleTagInput} />
        )}
      </ScrollContainer>
    );
  }
}

export default FrontsCAPISearchInput;
