// @flow

import React from 'react';
import type { Node as ReactNode } from 'react';
import { DedupeContext } from './Context';
import type { DedupeContextType, DuplicateGetter } from './Context';

type ExternalGetDuplicateProps = {|
  children: (getDuplicate: DuplicateGetter) => ReactNode
|};

type GetDuplicateProps = {|
  ...ExternalGetDuplicateProps,
  context: DedupeContextType
|};

class GetDuplicate extends React.Component<GetDuplicateProps> {
  getDuplicate = (type: string, key: string) => {
    const typeContext = this.props.context[type];
    return typeContext ? typeContext.getDuplicate(key) : null;
  };

  render() {
    return this.props.children(this.getDuplicate);
  }
}

export default (props: ExternalGetDuplicateProps) => (
  <DedupeContext.Consumer>
    {(context: DedupeContextType) => (
      <GetDuplicate {...props} context={context} />
    )}
  </DedupeContext.Consumer>
);
