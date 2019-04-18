import React from 'react';
import TestRenderer from 'react-test-renderer';
import Root from '../Root';
import Level from '../Level';

const createDragEvent = () => {
  const data: { [k: string]: any } = {};
  const types: string[] = [];
  let defaultPrevented = false;

  return {
    _data: data,
    get defaultPrevented() {
      return defaultPrevented;
    },
    preventDefault: () => {
      defaultPrevented = true;
    },
    dataTransfer: {
      get types() {
        return types.slice();
      },
      setData: (key: string, val: any) => {
        data[key] = val;
        types.push(key);
      },
      getData: (key: string) => data[key]
    }
  };
};

const runDrag = (type: any, data?: any, json: boolean = true) => (
  dropProps: any
) => {
  const e = createDragEvent();

  if (typeof type === 'string') {
    e.dataTransfer.setData(type, json ? JSON.stringify(data) : data);
  } else {
    // type is actually dragProps
    type.onDragStart(e);
  }

  dropProps.onDrop(e);
};

const setup = (jsx: React.ReactElement<any>) =>
  TestRenderer.create(jsx).getInstance();

describe('Guration', () => {
  it('creates MOVE events from dragged nodes', () => {
    let nodeProps;
    let dropProps;
    let edit: any;

    setup(
      <Root id="@@ROOT">
        <Level
          arr={[{ id: '1' }, { id: '2' }]}
          type="a"
          parentType="b"
          parentId="0"
          getId={({ id }) => id}
          onMove={() => null}
          onDrop={() => null}
          renderDrop={() => null}
        >
          {(child, getDragProps, i) => {
            if (i === 0) {
              nodeProps = getDragProps;
            }

            return (
              <Level
                arr={[{ id: '3' }, { id: '4' }]}
                type="a"
                parentType="a"
                parentId={child.id}
                getId={({ id }) => id}
                onMove={e => {
                  edit = e;
                }}
                onDrop={() => null}
                renderDrop={(getDropProps, _, __, j) => {
                  if (j === 1) {
                    dropProps = getDropProps;
                  }
                  return null;
                }}
              >
                {() => null}
              </Level>
            );
          }}
        </Level>
      </Root>
    );

    runDrag(nodeProps)(dropProps);

    expect(edit).toEqual({
      data: { id: '1' },
      from: { type: 'b', id: '0', index: 0 },
      to: { id: '2', type: 'a', index: 1 }
    });
  });

  it('creates INSERT events from arbitrary drops', () => {
    let dropProps;
    let event: any;
    let to: any;

    setup(
      <Root id="@@ROOT">
        <Level
          arr={[{ id: '2' }]}
          parentId="1"
          parentType="b"
          getId={({ id }) => id}
          onMove={() => null}
          onDrop={() => null}
          renderDrop={() => null}
          type="a"
        >
          {() => (
            <Level
              arr={[{ id: '1' }]}
              type="a"
              parentId="2"
              parentType="a"
              getId={({ id }) => id}
              onMove={() => null}
              onDrop={(e, toSpec) => {
                event = e;
                to = toSpec;
              }}
              renderDrop={getDropProps => {
                dropProps = getDropProps;
                return null;
              }}
            >
              {() => null}
            </Level>
          )}
        </Level>
      </Root>
    );

    const data = {
      type: 'a',
      id: 2
    };

    runDrag('text', {
      type: 'a',
      id: 2
    })(dropProps);

    expect(JSON.parse(event.dataTransfer.getData('text'))).toEqual(data);
    expect(to).toEqual({ id: '2', index: 1, type: 'a' });
  });

  it('does not allow moves of a node to a subPath of that node', () => {
    let dragProps;
    let dropProps;
    let edit;

    setup(
      <Root id="@@ROOT">
        <Level
          arr={[{ id: '2' }]}
          type="a"
          parentType="root"
          parentId="root"
          getId={({ id }) => id}
          onMove={() => null}
          onDrop={() => null}
          renderDrop={() => null}
        >
          {(_, getNodeProps) => {
            dragProps = getNodeProps;
            return (
              <Level
                arr={[{ id: '3' }]}
                type="a"
                parentType="a"
                getId={({ id }) => id}
                parentId="2"
                onMove={() => null}
                onDrop={e => {
                  edit = e;
                }}
                renderDrop={getDropProps => {
                  dropProps = getDropProps;
                  return null;
                }}
              >
                {() => null}
              </Level>
            );
          }}
        </Level>
      </Root>
    );

    runDrag(dragProps)(dropProps);

    expect(edit).toBeUndefined();
  });

  it('adjusts move indices when moving things that affect the drop index', () => {
    let dragProps;
    let dropProps;
    let edit: any;

    setup(
      <Root id="@@ROOT">
        <Level
          parentType="root"
          parentId="root"
          type="b"
          getId={({ id }) => id}
          arr={[{ id: '1' }, { id: '2' }, { id: '3' }]}
          onMove={e => {
            edit = e;
          }}
          onDrop={() => null}
          renderDrop={getDropProps => {
            dropProps = getDropProps;
            return null;
          }}
        >
          {(child, getNodeProps, i) => {
            if (i === 0) {
              dragProps = getNodeProps;
            }

            return false;
          }}
        </Level>
      </Root>
    );

    runDrag(dragProps)(dropProps);

    expect(edit.to.index).toBe(2);
  });

  it('does not create MOVE events when moves will have no impact', () => {
    let dragProps;
    let dropProps;
    let edit: any;

    setup(
      <Root id="@@ROOT">
        <Level
          arr={[{ id: '1' }]}
          parentType="root"
          parentId="root"
          getId={({ id }) => id}
          type="a"
          onMove={e => {
            edit = e;
          }}
          onDrop={() => null}
          renderDrop={getDropProps => {
            dropProps = getDropProps;
            return null;
          }}
        >
          {(child, getNodeProps) => {
            dragProps = getNodeProps;
            return null;
          }}
        </Level>
      </Root>
    );

    runDrag(dragProps)(dropProps);

    expect(edit).toBeUndefined();
  });

  it('creates inserts between roots', () => {
    let nodeProps;
    let dropProps;
    let edit: any;

    setup(
      <div>
        <Root id="@@ROOT">
          <Level
            type="a"
            getId={({ id }) => id}
            parentType="root"
            parentId="1"
            renderDrop={() => null}
            onMove={() => null}
            onDrop={() => null}
            arr={[{ id: '1' }]}
          >
            {(child, getNodeProps) => {
              nodeProps = getNodeProps;
              return null;
            }}
          </Level>
        </Root>
        <Root id="@@ROOT2">
          <Level
            type="a"
            getId={({ id }) => id}
            parentType="root"
            parentId="1"
            arr={[{ id: '2' }, { id: '3' }]}
            onMove={e => {
              edit = e;
            }}
            onDrop={() => null}
            renderDrop={getDropProps => {
              dropProps = getDropProps;
              return null;
            }}
          >
            {() => null}
          </Level>
        </Root>
      </div>
    );

    runDrag(nodeProps)(dropProps);

    expect(edit.from).toBe(false);
  });
});
