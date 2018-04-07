// @flow

import * as React from 'react';
import isEqual from 'lodash/isEqual';
import debounce from 'lodash/debounce';

type AsyncState<R> = {
  value: ?R,
  pending: boolean,
  error: ?any
};

type AsyncChild<R> = (state: AsyncState<R>) => React.Node;

type AsyncProps<A: mixed[], R> = {
  args: A,
  children: AsyncChild<R>,
  debounce?: number,
  fn: (...args: A) => Promise<R> | R,
  on: boolean
};

class Async<A: mixed[], R> extends React.Component<
  AsyncProps<A, R>,
  AsyncState<R>
> {
  static defaultProps = {
    debounce: 0,
    args: [],
    on: true
  };

  constructor(props: AsyncProps<A, R>) {
    super(props);
    // Currently can't change debounce value
    this.debouncedRun = this.props.debounce
      ? debounce(this.run, this.props.debounce)
      : this.run;
  }

  state: AsyncState<R> = {
    value: null,
    pending: false,
    error: null
  };

  componentDidMount() {
    this.update();
  }

  componentDidUpdate(prevProps: AsyncProps<A, R>) {
    this.update(prevProps);
  }

  debouncedRun: () => void;

  update(prevProps: ?AsyncProps<A, R>): void {
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
      this.debouncedRun();
    }
  }

  run = () => {
    this.setState(
      {
        pending: true,
        error: null
      },
      async () => {
        try {
          const value = await this.props.fn(...this.props.args);
          this.setState({
            value,
            pending: false
          });
        } catch (error) {
          this.setState({
            error
          });
        }
      }
    );
  };

  render() {
    return this.props.children(this.state);
  }
}

export type { AsyncChild };
export default Async;
