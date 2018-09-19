// @flow

import React from 'react';
import type { Node as ReactNode } from 'react';
import v4 from 'uuid/v4';
import throttle from 'lodash.throttle';
import Level from './Level';
import DedupeLevel from './DedupeLevel';
import { RootContext } from './Context';
import { addOffset, eq } from './utils/path';
import { getEdit } from './utils/edit';
import type { Edit } from './edits';
import type { Path } from './utils/path';
import type {
  InternalDrag,
  ExternalDrag,
  EventType,
  DuplicateGetter,
  IndexOffsetGetter
} from './types';

type InMap = {
  [string]: (value: string) => { id: string, type: string } | string
};

type SanitizedInMap = {
  [string]: (value: string) => ExternalDrag | string
};

type OutMap<T: Object> = {
  [string]: (el: T, type: string, id: string, path: Path[]) => string
};

const extractIndexOffset = (e: EventType, getIndexOffset: IndexOffsetGetter) =>
  typeof getIndexOffset === 'function' ? getIndexOffset(e) : getIndexOffset;

const sanitizeExternalDrops = (mappers: InMap) =>
  Object.keys(mappers).reduce(
    (acc, key) => ({
      ...acc,
      [key]: (text: string) => {
        const mapper = mappers[key];
        const data = mapper(text);

        if (typeof data === 'string') {
          return data;
        }

        return {
          ...data,
          dropType: 'EXTERNAL'
        };
      }
    }),
    {}
  );

const internalMapIn = (data: string) => ({
  ...JSON.parse(data),
  dropType: 'INTERNAL'
});

const internalMapOut = <T>(item: T, type: string, id: string, path: Path[]) =>
  JSON.stringify({
    id,
    type,
    path
  });

type RootProps<T: Object> = {
  id: string,
  type: string,
  field?: string,
  dedupeType?: string,
  onChange: (edit: Edit, getDuplicate: DuplicateGetter) => void,
  onError: (error: string) => void,
  mapIn: InMap,
  mapOut: OutMap<T>,
  children: ReactNode
};
type RootState = {
  dragData: ?InternalDrag,
  dropInfo: {
    path: ?(Path[]),
    canDrop: ?boolean
  }
};

class Root<T: Object> extends React.Component<RootProps<T>, RootState> {
  static defaultProps = {
    mapIn: {},
    mapOut: {},
    onChange: () => {},
    onError: () => {}
  };

  state = {
    dragData: null,
    dropInfo: {
      path: null,
      canDrop: false
    }
  };

  /**
   * All of the functions that map a drop to a node, the key being the
   * key on the `dataTransfer` object that this mapper can handle
   */
  get mapIn(): SanitizedInMap {
    return {
      ...sanitizeExternalDrops(this.props.mapIn),
      [this.rootKey]: internalMapIn
    };
  }

  /**
   * All of the functions that map a node to a drag, the key being the
   * key on the `dataTransfer` object that this mapper will create
   */
  get mapOut(): OutMap<T> {
    return {
      ...this.props.mapOut,
      [this.rootKey]: internalMapOut
    };
  }

  /**
   * This wraps set state to make sure we don't call it too much and keep
   * rerendering, only changing the drop state if things have actually changed
   */
  setDropInfo(path: ?(Path[]), canDrop: ?boolean) {
    const { path: prevPath } = this.state.dropInfo;
    if (
      (!path && prevPath) ||
      (path && !prevPath) ||
      (path && prevPath && !eq(path, prevPath))
    ) {
      this.setState({
        dropInfo: {
          path,
          canDrop
        }
      });
    }
  }

  /**
   * Runs through the inMappers to get the data
   */
  getDropData(e: EventType) {
    const { mapIn } = this;
    const type = Object.keys(mapIn).find(key => e.dataTransfer.getData(key));

    if (!type) {
      return `Unable to drop this: unknown drop type`;
    }

    const mapper = mapIn[type];

    return mapper(e.dataTransfer.getData(type));
  }

  /**
   * When a dragover event happens that has not been handled by a nodeDragOver
   * we are not in a position to dop anything
   */
  handleRootDragOver = () => {
    if (!this.eventHandled) {
      this.setDropInfo(null, false);
    }
    this.eventHandled = false;
  };

  /**
   * When a drop happens anywhere set event handle to false
   */
  handleRootDrop = () => {
    this.setDropInfo(null, false);
    this.eventHandled = false;
  };

  /**
   * This gets passed to all the nodes and allows them to say where they are
   * being dragged from and what type they are to allows us to show invalid
   * drops in the UI while dragging
   */
  handleNodeDragStart = (item: T, path: Path[], id: string, type: string) => (
    e: EventType
  ) =>
    this.runLowest(() => {
      Object.keys(this.mapOut).forEach(key => {
        const mapper = this.mapOut[key];
        const val = mapper(item, type, id, path);
        if (typeof val === 'string') {
          e.dataTransfer.setData(key, val);
        }
      });

      this.setState({
        dragData: {
          dropType: 'INTERNAL',
          rootKey: this.rootKey,
          path,
          type
        }
      });
    });

  /**
   * This gets run be each drop zone so that we know when we're hovering a drop
   * zone and we can find out the path of the drop zone we're hovering
   *
   * A drop zone may be a Node so getIndexOffset allows it to adjust where the
   * drop happens based on it's position over the node
   * top 50% = 0, bottom 50% = 1
   *
   * Ultimately this is responsible for updating the state to show whether we
   * can drop here
   */
  handleDropZoneDragOver = (
    candidatePath: Path[],
    getDuplicate: DuplicateGetter,
    getIndexOffset: IndexOffsetGetter
  ) => (e: EventType) =>
    this.runLowest(() => {
      e.preventDefault();
      this.runDropZoneDragOver(candidatePath, getDuplicate, getIndexOffset, e);
    });

  runDropZoneDragOver = throttle(
    (
      candidatePath: Path[],
      getDuplicate: DuplicateGetter,
      getIndexOffset: IndexOffsetGetter,
      e: EventType
    ) => {
      const { path, canDrop } = this.run(
        e,
        candidatePath,
        getDuplicate,
        getIndexOffset,
        this.state.dragData || true
      );

      this.setDropInfo(path, canDrop);
    },
    100,
    {
      trailing: false
    }
  );

  /**
   * This is similar to handleDropZoneDragOver but it's guaranteed to run the
   * handlers
   */
  handleDropZoneDrop = (
    candidatePath: Path[],
    getDuplicate: DuplicateGetter,
    getIndexOffset: IndexOffsetGetter
  ) => (e: EventType) =>
    this.runLowest(() => {
      e.preventDefault();
      this.run(e, candidatePath, getDuplicate, getIndexOffset);
    });

  /**
   * This method runs the drops
   * If dragData is truthy we're dragging and not dropping so we don't actually
   * want to run the the change / error handler, we just want to know whether
   * the drop would be valid and where the drop would be headed
   *
   * If dragData is exactly `true` then we're dragging but not from an internal
   * drag and because we can't inspect `dataTransfer` on dragover we'll just
   * have to permit any drop
   */
  run = (
    e: EventType,
    candidatePath: Path[],
    getDuplicate: DuplicateGetter,
    getIndexOffset: IndexOffsetGetter,
    dragData: ?($ElementType<RootState, 'dragData'> | true)
  ) => {
    const path = addOffset(
      candidatePath,
      extractIndexOffset(e, getIndexOffset)
    );

    if (dragData === true) {
      return { path, canDrop: true };
    }

    const data = dragData || this.getDropData(e);

    if (typeof data === 'string') {
      if (!dragData) {
        this.props.onError(data);
      }
      return { path, canDrop: false };
    }

    let edit;

    try {
      edit = getEdit(data, path, getDuplicate);
    } catch (error) {
      if (!dragData) {
        this.props.onError(error.message);
      }
    } finally {
      if (edit) {
        if (!dragData) {
          this.props.onChange(edit, getDuplicate);
        }
        /* eslint-disable no-unsafe-finally */
        // this lint rule can be ignored given we are not returning in try /
        // catch
        return { path, canDrop: true };
      }
      return { path, canDrop: false };
      /* eslint-enable no-unsafe-finally */
    }
  };

  // TODO: add mapOut

  /**
   * This uses event bubbling to make sure we're only handling drops for the
   * lowest handler (so we can drop into nested dropzones)
   *
   * When the event bubbles outside of the root we reset the `eventHandled` flag
   */
  runLowest(fn: () => void) {
    if (!this.eventHandled) {
      this.eventHandled = true;
      fn();
    }
  }

  eventHandled = false;
  rootKey: string = v4();

  render() {
    const { type, field, dedupeType, id } = this.props;
    return (
      <div
        onDragOver={this.handleRootDragOver}
        onDrop={this.handleRootDrop}
        onDragEnd={this.handleRootDrop}
      >
        <RootContext.Provider
          value={{
            handleDragStart: this.handleNodeDragStart,
            handleDragOver: this.handleDropZoneDragOver,
            handleDrop: this.handleDropZoneDrop,
            dropInfo: this.state.dropInfo
          }}
        >
          <DedupeLevel type={dedupeType}>
            <Level type={type} field={field} arr={[{ id }]}>
              {/**
               * Level requires a function child by here we're doing nothing
               * with the params
               */}
              {() => this.props.children}
            </Level>
          </DedupeLevel>
        </RootContext.Provider>
      </div>
    );
  }
}

export default Root;
