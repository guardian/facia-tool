// @flow

import * as React from 'react';
import styled from 'styled-components';
import SearchQuery from '../FrontsCAPI/SearchQuery';
import FrontsTagInput from './TagInput';
import ScrollContainer from '../ScrollContainer';
import TextInput from '../TextInput';

const Row = styled('div')`
  display: flex;
  margin: ${({ gutter = 16 }) => `0 -${gutter / 2}px`};
`;

const Col = styled(`div`)`
  flex: ${({ flex = 1 }) => flex};
  padding: ${({ gutter = 16 }) => `${gutter / 2}px`};
`;

type FrontsCAPISearchInputProps = {
  children: *
};

type FrontsCAPISearchInputState = {
  q: ?string,
  tag: ?string
};

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
    const { children } = this.props;
    const { tag, q } = this.state;

    return (
      <ScrollContainer
        fixed={
          <Row>
            <Col>
              <TextInput
                placeholder="Search"
                onChange={this.handleSearchInput}
                onClear={this.clearInput}
                width="100%"
              />
            </Col>
            <Col>
              <FrontsTagInput
                placeholder="Search tags"
                onChange={this.handleTagInput}
              />
            </Col>
          </Row>
        }
      >
        <SearchQuery params={{ tag, q }}>{children}</SearchQuery>
      </ScrollContainer>
    );
  }
}

export default FrontsCAPISearchInput;
