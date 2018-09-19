// @flow

import React from 'react';
import { DedupeContext } from './Context';
import GetDuplicate from './GetDuplicate';
import type { DedupeContextType } from './Context';
import type { Path } from './utils/path';

type ExternalDedupeNodeProps = {|
  index: number,
  path: Path[],
  dedupeKey?: string,
  type: string,
  children: *
|};

type DedupeNodeProps = {|
  ...ExternalDedupeNodeProps,
  context: DedupeContextType
|};

class DedupeNode extends React.Component<DedupeNodeProps> {
  componentDidMount = () => this.reregister();
  componentDidUpdate = () => this.reregister();
  componentWillUnmount = () => this.deregister();

  get dedupeContext() {
    return this.props.context[this.props.type];
  }

  deregister = () => {};

  reregister = () => {
    const { dedupeContext } = this;
    const { index, path, dedupeKey } = this.props;

    if (!dedupeKey) {
      return;
    }

    this.deregister();

    if (!dedupeContext) {
      return;
    }

    const { register, deregister } = dedupeContext;
    register(dedupeKey, index, path);
    this.deregister = () => deregister(dedupeKey);
  };

  render() {
    const { children } = this.props;
    return <GetDuplicate>{children}</GetDuplicate>;
  }
}

export default (props: ExternalDedupeNodeProps) => (
  <DedupeContext.Consumer>
    {(context: DedupeContextType) => (
      <DedupeNode {...props} context={context} />
    )}
  </DedupeContext.Consumer>
);
