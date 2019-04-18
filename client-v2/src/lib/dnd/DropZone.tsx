import React from 'react';
import { StoreConsumer } from './Root';
import { Store, Sub } from './store';
import { NO_STORE_ERROR } from './constants';
import { styled } from 'constants/theme';

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
  isActive: boolean;
}

const DropZoneContainer = styled.div<{ isActive: boolean }>`
  ${({ isActive }) => !isActive && 'pointer-events: none'}
`;

class DropZone extends React.Component<Props, State> {
  public state = { isTarget: false, isActive: false };

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
    return (
      <DropZoneContainer isActive={this.state.isActive}>
        {this.props.children(this.state.isTarget)}
      </DropZoneContainer>
    );
  }

  private handleStoreUpdate: Sub = (id, hoverIndex) => {
    const state = this.props.store && this.props.store.getState();
    const isActive = state ? state.isDraggedOver : false;
    if (isActive !== this.state.isActive) {
      this.setState({ isActive });
    }
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
