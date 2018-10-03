// @flow

import React from 'react';
import type { Register, Deregister } from './DedupeLevel';
import type { Path } from './utils/path';

type DedupeNodeProps = {|
  index: number,
  path: Path[],
  externalKey?: string,
  register: Register,
  deregister: Deregister,
  children: *
|};

class DedupeNode extends React.Component<DedupeNodeProps> {
  componentDidMount = () => this.reregister();
  componentDidUpdate = () => this.reregister();
  componentWillUnmount = () => this.deregister();

  deregister = () => {};

  reregister = () => {
    const { index, path, register, deregister, externalKey } = this.props;

    if (!externalKey) {
      return;
    }

    this.deregister();

    register(externalKey, index, path);
    this.deregister = () => deregister(externalKey);
  };

  render() {
    return this.props.children;
  }
}

export default DedupeNode;
