// @flow

import * as React from 'react';
import FrontsCapiSearchQuery from './FrontsCAPISearchQuery';
import CAPITagInput from './CAPITagInput';

type FrontsCAPISearchInputProps = {
  children: (value: *) => React.Node
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
        <CAPITagInput
          placeholder="Search tags"
          onChange={this.handleTagInput}
        />
        <FrontsCapiSearchQuery
          params={{
            tag,
            q
          }}
        >
          {children}
        </FrontsCapiSearchQuery>
      </React.Fragment>
    );
  }
}

export default FrontsCAPISearchInput;
