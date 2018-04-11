// @flow

import * as React from 'react';
import isEqual from 'lodash/isEqual';
import debounce from 'lodash/debounce';

type AsyncState<R> = {
  value: ?R,
  pending: boolean,
  error: ?(Error | string)
};

type AsyncChild<R> = (state: AsyncState<R>) => React.Node;

type AsyncProps<A: mixed[], R> = {
  args: A,
  children: AsyncChild<R>,
  debounce?: number,
  fn: (...args: A) => Promise<R> | R,
  on: boolean,
  intermediateLoadState: boolean
};

class Async<A: mixed[], R> extends React.Component<
  AsyncProps<A, R>,
  AsyncState<R>
> {
  static defaultProps = {
    debounce: 0,
    args: [],
    on: true,
    intermediateLoadState: false
  };

  constructor(props: AsyncProps<A, R>) {
    super(props);
    // Currently can't change debounce value
    this.debouncedStartRun = this.props.debounce
      ? debounce(this.startRun, this.props.debounce)
      : this.startRun;
  }

  state: AsyncState<R> = {
    value: null,
    pending: false,
    error: null
  };

  componentDidMount() {
    this.update(true);
  }

  componentDidUpdate(prevProps: AsyncProps<A, R>) {
    this.update(false, prevProps);
  }

  debouncedStartRun: (forceLoadState: boolean) => void;

  update(firstRun: boolean, prevProps: ?AsyncProps<A, R>): void {
    if (!this.props.on && (!prevProps || prevProps.on)) {
      this.setState({
        value: null,
        pending: false
      });
    } else if (
      !prevProps ||
      prevProps.fn !== this.props.fn ||
      !isEqual(prevProps.args, this.props.args)
    ) {
      this.debouncedStartRun(firstRun);
    }
  }

  startRun = (forceLoadState: boolean = false) => {
    if (this.props.intermediateLoadState || forceLoadState) {
      this.setState(
        {
          pending: true
        },
        this.run
      );
    } else {
      this.run();
    }
  };

  run = async () => {
    try {
      const value = await this.props.fn(...this.props.args);
      this.setState({
        value,
        pending: false
      });
    } catch (error) {
      this.setState({
        error,
        pending: false
      });
    }
  };

  render() {
    return this.props.children(this.state);
  }
}

export type { AsyncChild };
export default Async;
