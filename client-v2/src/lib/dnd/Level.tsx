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

interface DropProps {
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

type LevelChild<T> = (
  node: T,
  props: DropProps & NodeChildrenProps,
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
    props: DropProps,
    isTarget: boolean,
    index: number
  ) => React.ReactNode;
  isUneditable?: boolean;
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
      type,
      isUneditable
    } = this.props;
    return isUneditable ? (
      <>
        {arr.map((node, i) => (
          <React.Fragment key={getId(node)}>
            <DropZone parentKey={this.key} index={i}>
              {isTarget => renderDrop(this.getDropProps(i), isTarget, i)}
            </DropZone>
            <Node
              renderDrag={renderDrag}
              id={getId(node)}
              type={type}
              index={i}
              data={node}
            >
              {props => children(node, this.getNodeProps(i, props), i)}
            </Node>
          </React.Fragment>
        ))}
        <DropZone parentKey={this.key} index={arr.length}>
          {isTarget =>
            renderDrop(this.getDropProps(arr.length), isTarget, arr.length)
          }
        </DropZone>
      </>
    ) : (
      <>
        {arr.map((node, i) => {
          <React.Fragment key={getId(node)}>
            <Node id={getId(node)} type={type} index={i} data={node}>
              {props => children(node, this.getNodeProps(i, props), i)}
            </Node>
          </React.Fragment>;
        })}
      </>
    );
  }

  private getDropIndex(e: React.DragEvent, i: number, isNode: boolean) {
    return i + (isNode ? getDropIndexOffset(e) : 0);
  }

  private onDragOver = (i: number, isNode: boolean) => (e: React.DragEvent) => {
    if (!this.props.store) {
      throw new Error(NO_STORE_ERROR);
    }
    if (e.defaultPrevented) {
      return;
    }
    e.preventDefault();
    this.props.store.update(this.key, this.getDropIndex(e, i, isNode));
  };

  private onDrop = (i: number, isNode: boolean) => (e: React.DragEvent) => {
    if (e.defaultPrevented) {
      return;
    }

    e.preventDefault();
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

  private getDropProps(i: number) {
    return {
      onDragOver: this.onDragOver(i, false),
      onDrop: this.onDrop(i, false)
    };
  }

  private getNodeProps(i: number, props: NodeChildrenProps) {
    return {
      ...props,
      onDragOver: this.onDragOver(i, true),
      onDrop: this.onDrop(i, true)
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
