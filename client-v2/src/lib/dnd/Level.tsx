import React from 'react';
import Node, { ChildrenProps as NodeChildrenProps } from './Node';
import { StoreConsumer, isMove, isInside } from './Root';
import { Store } from './store';
import AddParentInfo, { PathConsumer, Parent } from './AddParentInfo';
import { TRANSFER_TYPE, NO_STORE_ERROR } from './constants';
import DropZone from './DropZone';

const getDropIndexOffset = ({
  currentTarget: el,
  clientY
}: React.DragEvent) => {
  const { top, height } = el.getBoundingClientRect();
  return clientY - top > height / 2 ? 1 : 0;
};

interface PosSpec {
  type: string;
  id: string;
  index: number;
}

const isOnSameLevel = (from: PosSpec, to: PosSpec): boolean =>
  from.type === to.type && from.id === to.id;

const adjustToIndexForMove = (from: PosSpec, to: PosSpec): PosSpec =>
  isOnSameLevel(from, to) && to.index > from.index
    ? { ...to, index: to.index - 1 }
    : to;

const isMoveToSamePosition = (from: PosSpec, to: PosSpec): boolean =>
  isOnSameLevel(from, to) && from.index === to.index;

interface Move<T> {
  data: T;
  from: false | PosSpec;
  to: PosSpec;
}

type DragHandler = (e: React.DragEvent) => void;

interface DropProps {
  onDragOver: DragHandler;
  onDrop: DragHandler;
}

type EventProps = { [K in keyof DropProps]?: DropProps[K] };

type ChildPropGetter = (
  maybeDropProps?: EventProps
) => DropProps & NodeChildrenProps;

type LevelChild<T> = (
  node: T,
  getChildProps: ChildPropGetter,
  index: number
) => React.ReactNode;

type MoveHandler<T> = (move: Move<T>) => void;
type DropHandler = (e: React.DragEvent, to: PosSpec) => void;

interface OuterProps<T> {
  arr: T[];
  children: LevelChild<T>;
  parentId: string;
  parentType: string;
  type: string;
  getId: (t: T) => string;
  onMove: (move: Move<T>) => void;
  onDrop: (e: React.DragEvent, to: PosSpec) => void;
  renderDrag?: (data: T) => React.ReactNode;
  renderDrop: (
    getDropProps: (maybeDropProps?: EventProps) => DropProps,
    isTarget: boolean,
    index: number
  ) => React.ReactNode;
  // any occurence of these in the data transfer will cause all dragging
  // behaviour to be bypassed
  blockingDataTransferTypes?: string[];
}

interface ContextProps {
  store: Store | null;
  parents: Parent[];
}

type Props<T> = OuterProps<T> & ContextProps;

class Level<T> extends React.Component<Props<T>> {
  get key() {
    return `${this.props.parentId}:${this.props.parentType}`;
  }

  public render() {
    const {
      renderDrop = () => null,
      renderDrag,
      children,
      arr,
      getId,
      type
    } = this.props;
    return (
      <>
        {arr.map((node, i) => (
          <React.Fragment key={getId(node)}>
            <DropZone parentKey={this.key} index={i}>
              {isTarget =>
                renderDrop(
                  (maybeDropProps: EventProps = {}) =>
                    this.getDropProps(i, maybeDropProps),
                  isTarget,
                  i
                )
              }
            </DropZone>
            <Node
              renderDrag={renderDrag}
              id={getId(node)}
              type={type}
              index={i}
              data={node}
            >
              {nodeProps =>
                children(
                  node,
                  (maybeDropProps: EventProps = {}) =>
                    this.getNodeProps(i, nodeProps, maybeDropProps),
                  i
                )
              }
            </Node>
          </React.Fragment>
        ))}
        <DropZone parentKey={this.key} index={arr.length}>
          {isTarget =>
            renderDrop(
              (maybeDropProps: EventProps = {}) =>
                this.getDropProps(arr.length, maybeDropProps),
              isTarget,
              arr.length
            )
          }
        </DropZone>
      </>
    );
  }

  private dragEventIsBlacklisted(e: React.DragEvent) {
    return e.dataTransfer.types.some(type =>
      (this.props.blockingDataTransferTypes || []).includes(type)
    );
  }

  private getDropIndex(e: React.DragEvent, i: number, isNode: boolean) {
    return i + (isNode ? getDropIndexOffset(e) : 0);
  }

  private onDragOver = (
    i: number,
    isNode: boolean,
    handleDragOver: DragHandler = () => {}
  ) => (e: React.DragEvent) => {
    e.preventDefault();
    handleDragOver(e);
    if (!this.props.store) {
      throw new Error(NO_STORE_ERROR);
    }
    if ((e as any).wasHandled || this.dragEventIsBlacklisted(e)) {
      return;
    }
    (e as any).wasHandled = true;
    this.props.store.update(this.key, this.getDropIndex(e, i, isNode));
  };

  private onDrop = (
    i: number,
    isNode: boolean,
    handleDrop: DragHandler = () => {}
  ) => (e: React.DragEvent) => {
    // defaultPrevented is being used as a way to communicate whether something
    // has already prevented
    handleDrop(e);
    if ((e as any).wasHandled || this.dragEventIsBlacklisted(e)) {
      return;
    }
    (e as any).wasHandled = true;

    const { onMove = () => null, onDrop = () => null } = this.props;
    const af = e.dataTransfer.getData(TRANSFER_TYPE);

    const to = {
      index: this.getDropIndex(e, i, isNode),
      type: this.props.parentType,
      id: this.props.parentId
    };

    if (!af) {
      return onDrop(e, to);
    }

    const { parents, id, index, type, data } = JSON.parse(af);

    if (!isInside(this.props.parents, [type, id])) {
      const [parentType, parentId] = parents[parents.length - 1];
      const from = isMove(this.props.parents, parents) && {
        type: parentType,
        id: parentId,
        index
      };

      const adjustedTo = from ? adjustToIndexForMove(from, to) : to;

      if (!(from && isMoveToSamePosition(from, adjustedTo))) {
        return onMove({ data, to: adjustedTo, from });
      }
    }
  };

  private getDropProps(i: number, maybeDropProps: EventProps) {
    return {
      ...maybeDropProps,
      onDragOver: this.onDragOver(i, false, maybeDropProps.onDragOver),
      onDrop: this.onDrop(i, false, maybeDropProps.onDrop)
    };
  }

  private getNodeProps(
    i: number,
    props: NodeChildrenProps,
    maybeDropProps: EventProps
  ) {
    return {
      ...maybeDropProps,
      ...props,
      onDragOver: this.onDragOver(i, true, maybeDropProps.onDragOver),
      onDrop: this.onDrop(i, true, maybeDropProps.onDrop)
    };
  }
}

export default <T extends any>(props: OuterProps<T>) => (
  <StoreConsumer>
    {(store: Store | null) => (
      <AddParentInfo id={props.parentId} type={props.parentType}>
        <PathConsumer>
          {(parents: Parent[]) => (
            <Level
              {...props}
              key={props.parentId} // resubscribe to store if every changes (this might be too nuclear)
              parents={parents}
              store={store}
            />
          )}
        </PathConsumer>
      </AddParentInfo>
    )}
  </StoreConsumer>
);

export { Move, PosSpec, LevelChild, MoveHandler, DropHandler };
