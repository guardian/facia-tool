import React from 'react';
import isEqual from 'lodash/isEqual';
import debounce from 'lodash/debounce';

interface AsyncState<R> {
  value: R | void;
  pending: boolean;
  error: Error | string | void;
}

type AsyncChild<R> = (state: AsyncState<R>) => React.ReactNode;

interface AsyncProps<A extends any[], R> {
  args: A;
  children: AsyncChild<R>;
  debounce?: number;
  fn?: (...args: A) => Promise<R> | R;
  on: boolean;
  intermediateLoadState?: boolean;
}

class Async<A extends any[], R> extends React.Component<
  AsyncProps<A, R>,
  AsyncState<R>
> {
  public static defaultProps = {
    debounce: 0,
    args: [],
    on: true,
    showLoading: false
  };

  public state: AsyncState<R> = {
    value: undefined,
    pending: false,
    error: undefined
  };

  public debouncedStartRun: () => void;

  constructor(props: AsyncProps<A, R>) {
    super(props);
    // Currently can't change debounce value
    this.debouncedStartRun = this.props.debounce
      ? debounce(this.startRun, this.props.debounce)
      : this.startRun;
  }

  public componentDidMount() {
    this.update();
  }

  public componentDidUpdate(prevProps: AsyncProps<A, R>) {
    this.update(prevProps);
  }

  public update(prevProps?: AsyncProps<A, R> | void): void {
    if (!this.props.on && (!prevProps || prevProps.on)) {
      this.setState({
        value: undefined,
        pending: false,
        error: undefined
      });
    } else if (!prevProps || prevProps.fn !== this.props.fn) {
      // don't debounce when changing the function
      this.startRun();
    } else if (!isEqual(prevProps.args, this.props.args)) {
      this.debouncedStartRun();
    }
  }

  public startRun = () => {
    this.setState(
      {
        pending: true
      },
      this.run
    );
  };

  public run = async () => {
    try {
      const value = await (this.props.fn && this.props.fn(...this.props.args));
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

  public render() {
    return this.props.children(this.state);
  }
}

export { AsyncChild, AsyncState };
export default Async;
