// @flow

import * as React from 'react';
import styled from 'styled-components';

import SearchQuery from '../CAPI/SearchQuery';
import ScrollContainer from '../ScrollContainer';
import TextInput from '../TextInput';

type FrontsCAPISearchInputProps = {
  children: *,
  additionalFixedContent?: React.ComponentType<any>
};

type FrontsCAPISearchInputState = {
  q: ?string,
  tag: ?string
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
    tag: null
  };

  clearInput = () => {
    this.setState({
      q: ''
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

  render() {
    const {
      children,
      additionalFixedContent: AdditionalFixedContent
    } = this.props;
    const { tag, q } = this.state;

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
              />
            </InputContainer>
            {AdditionalFixedContent && <AdditionalFixedContent />}
          </React.Fragment>
        }
      >
        <SearchQuery
          params={{
            tag,
            q,
            'show-elements': 'image',
            'show-fields': 'trailText'
          }}
          poll={30000}
        >
          {children}
        </SearchQuery>
      </ScrollContainer>
    );
  }
}

export default FrontsCAPISearchInput;
