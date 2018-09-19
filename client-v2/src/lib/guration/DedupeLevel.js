// @flow

import React from 'react';
import type { Node as ReactNode } from 'react';
import type { Path } from './utils/path';

type DedupeInfo = { index: number, path: Path[] };

type Register = (key: string, index: number, path: Path[]) => void;
type Deregister = (key: string) => void;

type DedupeLevelProps = {|
  active?: boolean,
  children: (
    register: Register,
    deregister: Deregister,
    getDuplicate: (key: string) => DedupeInfo | null
  ) => ReactNode
|};

class DedupeLevel extends React.Component<DedupeLevelProps> {
  getDuplicate = (key: string) =>
    this.props.active ? this.dedupeContext[key] || null : null;

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
    return this.props.children(
      this.register,
      this.deregister,
      this.getDuplicate
    );
  }
}

export default DedupeLevel;
export type { Register, Deregister };
