// @flow

import React from 'react';
import type { Node as ReactNode } from 'react';
import { DedupeContext } from './Context';
import type { DedupeContextType } from './Context';
import type { Path } from './utils/path';

type ExternalDedupeLevelProps = {|
  type?: string,
  children: ReactNode
|};

type DedupeLevelProps = {|
  ...ExternalDedupeLevelProps,
  parentContext: DedupeContextType
|};

type DedupeInfo = { index: number, path: Path[] };

class DedupeLevel extends React.Component<DedupeLevelProps> {
  getDuplicate = (key: string) => this.dedupeContext[key] || null;

  deregister = (key: string) => {
    const { [key]: omit, ...rest } = this.dedupeContext;
    this.dedupeContext = rest;
  };

  register = (key: string, index: number, path: Path[]) => {
    this.dedupeContext = {
      ...this.dedupeContext,
      [key]: {
        index,
        path
      }
    };
  };

  dedupeContext: { [string]: DedupeInfo } = {};

  render() {
    const context = this.props.type
      ? {
          [this.props.type]: {
            register: this.register,
            deregister: this.deregister,
            getDuplicate: this.getDuplicate
          },
          ...this.props.parentContext // keep parent context where possible
        }
      : this.props.parentContext;
    return (
      <DedupeContext.Provider value={context}>
        {this.props.children}
      </DedupeContext.Provider>
    );
  }
}

export default (props: ExternalDedupeLevelProps) => (
  <DedupeContext.Consumer>
    {parentContext => <DedupeLevel {...props} parentContext={parentContext} />}
  </DedupeContext.Consumer>
);
