import React from 'react';
import Node from './Node';
import { NodeChildren } from './Node';
import { RootContext } from './Context';
import { eq } from './utils/path';
import { Path } from './utils/path';
import { EventType } from './types';
import AddPathLevel from './utils/AddPathLevel';

const isUndefined = (x: unknown) => typeof x === 'undefined';

type DropProps = {
  onDrop: (e: EventType) => void;
  onDragOver: (e: EventType) => void;
};

type DropContext = {
  isTarget: boolean;
  canDrop: boolean | null;
};

type DropRenderer = (
  getDropProps: () => DropProps,
  dropContext: DropContext,
  index: number
) => React.ReactNode;

const doRenderDrop = (
  renderDrop: DropRenderer | void,
  onDrop: (e: EventType) => void,
  onDragOver: (e: EventType) => void,
  canDrop: boolean | null,
  dropPath: Path[] | null,
  path: Path[],
  i: number
) => {
  if (!renderDrop) {
    return null;
  }

  const isTarget = !!dropPath && eq(path, dropPath);

  return renderDrop(
    () => ({
      onDrop,
      onDragOver
    }),
    {
      canDrop: isTarget && canDrop,
      isTarget
    },
    i
  );
};

const doGetKey = <T extends any>(
  getKey: ((node: T) => string) | void,
  item: T
) => {
  if (getKey) {
    return getKey(item);
  } else if (item.id) {
    const id = item.id;
    if (typeof id === 'string') {
      return id;
    }
  }
  return undefined;
};

type LevelProps<T> = {
  arr: T[];
  type: string;
  children: NodeChildren<T>;
  renderDrag?: (el: T) => React.ReactNode;
  renderDrop?: DropRenderer;
  getKey?: (node: T) => string;
  dropOnNode?: boolean;
  field?: string;
};

class Level<T> extends React.Component<LevelProps<T>> {
  static defaultProps = {
    dropOnNode: true, // sets node drag props to allow drops
    getKey: <U extends { id: string }>({ id }: U) => id
  };

  get childrenField() {
    return this.props.field || `${this.props.type}s`;
  }

  render() {
    const {
      arr,
      type,
      children,
      renderDrag,
      renderDrop,
      getKey = (i: any): any => i && i.id,
      dropOnNode
    } = this.props;

    let didWarnKey = false;

    return (
      <RootContext.Consumer>
        {({
          handleDragStart,
          handleDragOver,
          handleDrop,
          dropInfo: { canDrop, path: dropPath }
        }) => (
          <React.Fragment>
            {arr.map((item, i) => {
              const key = doGetKey(getKey, item);

              if (isUndefined(key) && !didWarnKey) {
                /* eslint-disable-next-line */
                console.warn(
                  `\`getKey\` is returning undefined for type ${type}. This may cause unnecessary re-renders for these nodes and will cause React errors in development.`
                );
                didWarnKey = true;
              }

              return (
                <React.Fragment key={key}>
                  <AddPathLevel
                    childrenField={this.childrenField}
                    id="@@DROP"
                    type={type}
                    index={i}
                  >
                    {path =>
                      doRenderDrop(
                        renderDrop,
                        handleDrop(path, 0),
                        handleDragOver(path, 0),
                        canDrop,
                        dropPath,
                        path,
                        i
                      )
                    }
                  </AddPathLevel>
                  <Node
                    item={item}
                    id={key || ''}
                    type={type}
                    index={i}
                    renderDrag={renderDrag}
                    childrenField={this.childrenField}
                    // TODO: maybe move this into Node?
                    handleDragStart={handleDragStart}
                    handleDragOver={!!dropOnNode && handleDragOver}
                    handleDrop={!!dropOnNode && handleDrop}
                  >
                    {children}
                  </Node>
                </React.Fragment>
              );
            })}
            <AddPathLevel
              childrenField={this.childrenField}
              id="@@DROP"
              type={type}
              index={arr.length}
            >
              {path =>
                doRenderDrop(
                  renderDrop,
                  handleDrop(path, 0),
                  handleDragOver(path, 0),
                  canDrop,
                  dropPath,
                  path,
                  arr.length
                )
              }
            </AddPathLevel>
          </React.Fragment>
        )}
      </RootContext.Consumer>
    );
  }
}

export default Level;
