# Guration

A module that allows you to validate drag and drop actions on a tree of data, culminating in 'edits' that describe the modification on a normalized data structure (rather than the whole tree). There are two types of edits a `Move` and an `Insert`. The drag and drop logic is handle by the `Level` component, so references below to drag zones and drop zones will refer to the drag zones created using the `Level` component.

Note that **a valid drop doesn't changed the rendered tree**, instead the expectation is that state updates will be made in the consumer appilcation in response to these edits that cause a render to the `Guration` part of the app that then reflects these edits.

## Edits

First it will be worth describing edits. Edits are objects that describe an update to the tree and will only be fired when they are deemed to be valid (i.e. a drop of some `type` into a position that accepts that `type`). Moves into the same position (i.e. moving an node into the drop zone either side of itself) will not fire edits, and edits that are invalid will fire errors.

### `Move`

A `Move` edit describes a move of a node from inside the Guration `Root` context back into another valid position inside the same Guration `Root` context. It has the following shape:

```js
type Move = {
  type: 'MOVE',
  payload: {
    type,
    id,
    from: {
      parent: {
        type: string,
        childrenField: string,
        index: number,
        id: string
      }
    },
    to: {
      parent: {
        type: string,
        childrenField: string,
        index: number,
        id: string
      },
      index: newIndex
    }
  },
  meta: Object
};
```

### `Insert`

An `Insert` edit will fire for an insert of some item from outside that has been mapped in through [`mapIn`](#mapIn). It has the following shape:

```js
type Insert = {
  type: 'INSERT',
  payload: {
    type: string,
    id: string,
    path: {
      index: number,
      parent: {
        type: string,
        childrenField: string,
        index: number,
        id: string
      }
    }
  },
  meta: Object
};
```

## Component API

### `<Root />`

This is the wrapper around a `Guration` context and [`Levels`](#Level) cannot be rendered outside of a `Root`. It's component that allows you to listen for edits made from drag and drop actions.

#### Props

##### `id: string`

This is the root id that will be used as the parent of the whole tree and will appear in edits that drop into drop zones for the root level of the tree.

##### `type: string`

Similarly to the [`id`](#id) this will describe the type of the root node (again, used in edits) but this is also what limits drops into this position: only drops of the same type can be made at the root level.

##### `field?: string`

This will set the `childrenField` in an edit, which can allow for easier reflection on the type of edit to be made.

##### `onChange?: (edit: Edit, getDuplicate: (type: string, key: string) => { index: number, path: Path[] }) => void`

This expects a callback function that will receive an of (`edit`)[#Edits] each time an action has happened. It also receives a function that will return any duplicates in the current Guration context. This is useful for working out whether nested items (perhaps passed `meta`) are duplicates.

##### `onError?: (error: string) => void`

A callback that will recieve strings describing errors regarding invalid drops. For example, dropping an node of one type into a level of another type or dropping an node into a child of itself.

##### `mapIn?: { [string]: string => Promise<{ id: string, type: string, meta?: Object }> }`

An object whose keys represent a `type` on `e.dataTransfer.types` that can be handle by the callback that is in the value position of the object. The callback will receive any data that is found when `e.dataTranfer.getData(type)` is called and is expected to return a Promise (or not, but Flow will complain!) object of `{ id: string, type: string }` that can be used to validate and then generate an edit in a drop zone. This object can also have an optional `meta` key to pass through to the any subsequent if required. It allows a Promise so that the consumer can fetch extra data from external drops.

##### `mapOut?: { [string]: (el: Object, type: string, id: string, path: Path[]) => string }`

An object that does the opposite of `mapIn` and describes how to transform a node into drag data. The keys on the object are the keys that will be called using `e.dataTransfer.setData(key)`, allowing drags from here to other drop zones (possibly other Guration contexts).

##### `dedupe: ?boolean`

Specifying this on the will ensure that any insert on the top level that has the same `externalKey` will act as a move rather than an insert.

**default is `true`**

### `<Level />`

A `Level` is repsonsible for defining the types for a specific level in the tree as well as defining the types for the nodes that _are_ currently rendered in that position. It also provides the props for draggable nodes and renders drop zones between these nodes.

#### Props

##### `arr: <T: Object>[]`

The array of nodes to map over. Passing this in allows the component to handle laying out drop zones between each node (using fragments) and plucking the id of each node in order to construct edits.

##### `children: (item, getNodeProps, index) => ReactElement`

This is not a React element but a function child. `item` is an item in the array, `getNodeProps()` is a function that will return the node props (such as the drag event handlers etc.) to spread on a React DOM node to make it draggable. In future it will taking a prop argument that will allow adding other props to the same Node. Currently, all event handlers that are added by these props, would be remove if adding the same event handlers to the same node.

##### `type: string`

Much like `Root` this specifies both the time of the draggable nodes at this level and the type of node that can be dragged to this level.

##### `field: ?string`

Again much like `Root` this specifies the `childrenField` field of an edit that can help for making updates.

##### `renderDrop: ?(getDropProps, { canDrop: boolean, isTarget: boolean }, index) => ReactElement`

This is a function that will be used to render the drops between the draggable nodes rendered by `children`. `isOver` is much like `:hover` pseduo-selector except that when `dropOnNode` is true `isTarget` will also be true when that position is the target position for a drop while hovering a node.

##### `getKey: ?(el: T) => string`

A function that returns the key from each object in the array, defaults to `({ id }) => id`

##### `getExternalKey: ?(el: T) => string`

The function that returns the key for comapring items for deduping, defaults to `getKey`.

##### `dedupe: ?boolean`

Specifying this on the will ensure that any insert on this level that has the same `externalKey` will act as a move rather than an insert.

**default is `true`**

##### `dropOnNode: ?boolean`

A boolean that defaults to `true`, which specifics whether `getNodeProps` will return props that allow dropping on top of the node. If this is true, dropping in the top 50% of the node will result in a drop at that node's index, and likewise dropping in the bottom 50% will result in a drop at the index after that node.

## Example

```js
const renderDrop = (getProps, { canDrop, isTarget }) =>
  <DropZone {...getProps()} canDrop={canDrop} isTarget={isTarget} />;

const Front = ({ front }) => (
  <Root
    id={front.id}
    type="front"
    onChange={console.log}
    onError={console.log}
  >
    <Level
      arr={front.collections}
      type="collection"
      renderDrop={renderDrop}
      dedupeType="articleFragment"
    >
      {({ title, articleFragments }) => (
        <div>
          <h1>{title}</h1>
          <Indent>
            <Level
              arr={articleFragments}
              type="articleFragment"
              renderDrop={renderDrop}
            >
              {({ title, meta: { supporting } }, afNodeProps) => (
                <div>
                  <h1 {...afNodeProps()}>{title}</h1>
                  <Indent>
                    <Level
                      arr={supporting}
                      type="articleFragment"
                      renderDrop={renderDrop}
                    >
                      {({ title }, sNodeProps) => (
                        <div>
                          <h1 {...sNodeProps()}>{title}</h1>
                        </div>
                      )}
                    </Level>
                  </Indent>
                </div>
              )}
            </Level>
          </Indent>
        </div>
      )}
    </Level>
  </Root>
);
```
