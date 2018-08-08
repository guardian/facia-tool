// @flow

import * as React from 'react';
import SearchQuery from '../CAPI/SearchQuery';
import FrontsTagInput from './TagInput';
import ScrollContainer from '../ScrollContainer';
import TextInput from '../TextInput';
import Row from '../Row';
import Col from '../Col';

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
        <SearchQuery
          params={{
            tag,
            q,
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
}

export default FrontsCAPISearchInput;
