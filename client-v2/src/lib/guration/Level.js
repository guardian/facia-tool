// @flow

import React from 'react';
import type { Node as ReactNode } from 'react';
import Node from './Node';
import type { NodeChildren } from './Node';
import GetDuplicate from './GetDuplicate';
import { RootContext } from './Context';
import { eq } from './utils/path';
import type { Path } from './utils/path';
import type { EventType } from './types';
import AddPathLevel from './utils/AddPathLevel';

const isUndefined = x => typeof x === 'undefined';

type DropProps = {
  onDrop: (e: EventType) => void,
  onDragOver: (e: EventType) => void
};

type DropContext = {
  isTarget: boolean,
  canDrop: ?boolean
};

type DropRenderer = (
  getDropProps: () => DropProps,
  dropContext: DropContext,
  index: number
) => ReactNode;

const doRenderDrop = (
  renderDrop: ?DropRenderer,
  onDrop,
  onDragOver,
  canDrop: ?boolean,
  dropPath: ?(Path[]),
  path,
  i
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

type LevelProps<T> = {|
  arr: T[],
  type: string,
  children: NodeChildren<T>,
  renderDrop?: DropRenderer,
  getKey: (node: T) => string,
  getDedupeKey?: (node: T) => string,
  dropOnNode: boolean,
  field?: string
|};

class Level<T> extends React.Component<LevelProps<T>> {
  static defaultProps = {
    dropOnNode: true, // sets node drag props to allow drops
    getKey: <U: { id: string }>({ id }: U) => id
  };

  get childrenField() {
    return this.props.field || `${this.props.type}s`;
  }

  render() {
    const {
      arr,
      type,
      children,
      renderDrop,
      getKey,
      getDedupeKey = getKey,
      dropOnNode
    } = this.props;

    let didWarnKey = false;
    let didWarnDedupeKey = false;

    return (
      <GetDuplicate>
        {getDuplicate => (
          <RootContext.Consumer>
            {({
              handleDragStart,
              handleDragOver,
              handleDrop,
              dropInfo: { canDrop, path: dropPath }
            }) => (
              <React.Fragment>
                {arr.map((item, i) => {
                  const key = getKey(item);
                  const dedupeKey = getDedupeKey(item);

                  if (isUndefined(key) && !didWarnKey) {
                    /* eslint-disable-next-line */
                    console.warn(
                      `\`getKey\` is returning undefined for type ${type}. This may cause unnecessary re-renders for these nodes and will cause React errors in development.`
                    );
                    didWarnKey = true;
                  }

                  if (isUndefined(dedupeKey) && !didWarnDedupeKey) {
                    /* eslint-disable-next-line */
                    console.warn(
                      `\`getDedupeKey\` is returning undefined for type ${type}. This will cause issues when trying to dedupe new nodes in this context.`
                    );
                    didWarnDedupeKey = true;
                  }

                  return (
                    <React.Fragment key={getKey(item)}>
                      <AddPathLevel
                        childrenField={this.childrenField}
                        id="@@DROP"
                        type={type}
                        index={i}
                      >
                        {path =>
                          doRenderDrop(
                            renderDrop,
                            handleDrop(path, getDuplicate, 0),
                            handleDragOver(path, getDuplicate, 0),
                            canDrop,
                            dropPath,
                            path,
                            i
                          )
                        }
                      </AddPathLevel>
                      <Node
                        item={item}
                        id={getKey(item)}
                        dedupeKey={getDedupeKey(item)}
                        type={type}
                        index={i}
                        childrenField={this.childrenField}
                        // TODO: maybe move this into Node?
                        handleDragStart={handleDragStart}
                        handleDragOver={dropOnNode && handleDragOver}
                        handleDrop={dropOnNode && handleDrop}
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
                      handleDrop(path, getDuplicate, 0),
                      handleDragOver(path, getDuplicate, 0),
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
        )}
      </GetDuplicate>
    );
  }
}

export default Level;
