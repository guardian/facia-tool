import React from 'react';
import { $ElementType } from 'utility-types';
import { EventType, IndexOffsetGetter } from './types';
import AddPathLevel from './utils/AddPathLevel';
import { Path } from './utils/path';

const getDropIndexOffset = ({ currentTarget: el, clientY }: EventType) => {
  const { top, height } = el.getBoundingClientRect();
  const y = clientY - top;
  return y > height / 2 ? 1 : 0;
};

type DOMNodeProps = {
  draggable: boolean;
  onDragStart: (e: EventType) => void;
  onDragOver?: void | ((e: EventType) => void);
  onDrop?: void | ((e: EventType) => void);
};

type NodeProps<T> = {
  item: T;
  id: string;
  type: string;
  childrenField: string;
  index: number;
  renderDrag: void | ((el: T) => React.ReactNode);
  handleDragStart: (
    item: T,
    path: Path[],
    id: string,
    type: string
  ) => (e: EventType) => void;
  handleDragOver:
    | ((
        candidatePath: Path[],
        getIndexOffset: IndexOffsetGetter
      ) => (e: EventType) => void)
    | false;
  handleDrop:
    | ((
        candidatePath: Path[],
        getIndexOffset: IndexOffsetGetter
      ) => (e: EventType) => void)
    | false;
  children: (
    node: T,
    getNodeProps: () => DOMNodeProps,
    index: number
  ) => React.ReactNode;
};

class Node<T> extends React.Component<NodeProps<T>> {
  dragImage: HTMLDivElement | null = null;

  handleDragStart = (handleDragStart: (e: EventType) => void) => (
    e: EventType
  ) => {
    if (this.dragImage) {
      e.dataTransfer.setDragImage(this.dragImage, 10, 10);
    }
    handleDragStart(e);
  };

  render() {
    const {
      item,
      id,
      type,
      childrenField,
      index,
      renderDrag,
      handleDragStart,
      handleDragOver,
      handleDrop,
      children
    } = this.props;
    return (
      <React.Fragment>
        {renderDrag && (
          <div
            style={{
              position: 'absolute',
              transform: 'translateX(-9999px)'
            }}
            ref={node => {
              this.dragImage = node;
            }}
          >
            {renderDrag(item)}
          </div>
        )}
        <AddPathLevel
          id={id}
          type={type}
          childrenField={childrenField}
          index={index}
        >
          {path =>
            children(
              item,
              () => ({
                draggable: true,
                onDragStart: this.handleDragStart(
                  handleDragStart(item, path, id, type)
                ),
                ...(handleDrop && handleDragOver
                  ? {
                      onDrop: handleDrop(path, getDropIndexOffset),
                      onDragOver: handleDragOver(path, getDropIndexOffset)
                    }
                  : {})
              }),
              index
            )
          }
        </AddPathLevel>
      </React.Fragment>
    );
  }
}

type NodeChildren<T> = $ElementType<NodeProps<T>, 'children'>;

export { NodeChildren };

export default Node;
