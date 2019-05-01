import React, { createContext } from 'react';
import AddParentInfo, { isMove, isInside } from './AddParentInfo';
import createStore, { Store } from './store';

const { Provider: StoreProvider, Consumer: StoreConsumer } = createContext(
  null as Store | null
);

const dragEventIsBlacklisted = (
  e: React.DragEvent,
  blacklist: string[] | undefined
) => {
  return e.dataTransfer.types.some(type => (blacklist || []).includes(type));
};

interface OuterProps {
  id: string;
  // Any occurence of these in the data transfer will cause all dragging
  // behaviour to be bypassed.
  blacklistedDataTransferTypes?: string[];
}

type Props = OuterProps &
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

interface State {
  store: Store;
}

export default class Root extends React.Component<Props, State> {
  public state = { store: createStore() };

  public render() {
    const { id, blacklistedDataTransferTypes, ...divProps } = this.props;
    return (
      <div
        {...divProps}
        onDragOver={this.onDragOver}
        onDragLeave={this.onDragLeave}
        onDragEnd={() => this.reset(false)}
        onDrop={() => this.reset(false)}
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
    const isBlacklisted = dragEventIsBlacklisted(
      e,
      this.props.blacklistedDataTransferTypes
    );
    if (!e.defaultPrevented || isBlacklisted) {
      // Don't alter the dragOver state if we're dealing with a
      // blacklisted drag type.
      this.reset(!isBlacklisted);
      return;
    }
    const state = this.state.store.getState();
    const { key, index } = state;
    this.state.store.update(key, index, true);
  };

  private onDragLeave = ({
    clientX: cx,
    clientY: cy,
    currentTarget
  }: React.DragEvent) => {
    // is there a better way to do this?
    const { top, right, bottom, left } = currentTarget.getBoundingClientRect();
    if (cx <= left || cx >= right || cy <= top || cy >= bottom) {
      this.reset(false);
    }
  };

  private reset = (isDraggedOver: boolean) => {
    this.state.store.update(null, null, isDraggedOver);
  };
}

export { StoreConsumer, isMove, isInside, dragEventIsBlacklisted };
