import React from 'react';
import { StoreConsumer } from './Root';
import { Store, Sub } from './store';
import { NO_STORE_ERROR } from './constants';

interface OuterProps {
  parentKey: string;
  index: number;
  children: (isTarget: boolean) => React.ReactNode;
}

interface ContextProps {
  store: Store | null;
}

type Props = OuterProps & ContextProps;

interface State {
  isTarget: boolean;
}

class DropZone extends React.Component<Props, State> {
  public state = { isTarget: false };

  public componentDidMount() {
    if (!this.props.store) {
      throw new Error(NO_STORE_ERROR);
    }
    this.props.store.subscribe(this.handleStoreUpdate);
  }

  public componentWillUnmount() {
    if (!this.props.store) {
      throw new Error(NO_STORE_ERROR);
    }
    this.props.store.unsubscribe(this.handleStoreUpdate);
  }

  public render() {
    return this.props.children(this.state.isTarget);
  }

  private handleStoreUpdate: Sub = (id, hoverIndex) => {
    if (
      id === this.props.parentKey &&
      hoverIndex === this.props.index &&
      !this.state.isTarget
    ) {
      this.setState({ isTarget: true });
    } else if (
      (id !== this.props.parentKey || hoverIndex !== this.props.index) &&
      this.state.isTarget
    ) {
      this.setState({ isTarget: false });
    }
  };
}

export default (props: OuterProps) => (
  <StoreConsumer>
    {store => <DropZone {...props} store={store} />}
  </StoreConsumer>
);
