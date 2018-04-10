// @flow

import * as React from 'react';
import SearchQuery from '../FrontsCAPI/SearchQuery';
import FrontsTagInput from './TagInput';

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
      <React.Fragment>
        <input placeholder="Search" onChange={this.handleSearchInput} />
        <FrontsTagInput
          placeholder="Search tags"
          onChange={this.handleTagInput}
        />
        <SearchQuery params={{ tag, q }}>{children}</SearchQuery>
      </React.Fragment>
    );
  }
}

export default FrontsCAPISearchInput;
