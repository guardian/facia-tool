import React, { createContext } from 'react';
import AddParentInfo, { isMove, isInside } from './AddParentInfo';
import createStore, { Store } from './store';

const { Provider: StoreProvider, Consumer: StoreConsumer } = createContext(
  null as Store | null
);

interface OuterProps {
  id: string;
}

type Props = OuterProps &
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

interface State {
  store: Store;
}

export default class Root extends React.Component<Props, State> {
  public state = { store: createStore() };

  public render() {
    const { id, ...divProps } = this.props;
    return (
      <div
        {...divProps}
        onDragOver={this.onDragOver}
        onDragLeave={this.onDragLeave}
        onDragEnd={this.reset}
        onDrop={this.reset}
      >
        <StoreProvider value={this.state.store}>
          <AddParentInfo id={this.props.id} type="root">
            {this.props.children}
          </AddParentInfo>
        </StoreProvider>
      </div>
    );
  }

  private onDragOver = (e: React.DragEvent) => {
    if (!e.defaultPrevented) {
      this.reset();
      return;
    }
  };

  private onDragLeave = ({
    clientX: cx,
    clientY: cy,
    currentTarget
  }: React.DragEvent) => {
    // is there a better way to do this?
    const { top, right, bottom, left } = currentTarget.getBoundingClientRect();
    if (cx <= left || cx >= right || cy <= top || cy >= bottom) {
      this.reset();
    }
  };

  private reset = () => {
    this.state.store.update(null, null, false);
  };
}

export { StoreConsumer, isMove, isInside };
