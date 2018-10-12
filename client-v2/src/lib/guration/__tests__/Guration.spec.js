

import React from 'react';
import TestRenderer from 'react-test-renderer';
import Root from '../Root';
import Level from '../Level';

const createDragEvent = () => {
  const data = {};

  return {
    _data: data,
    preventDefault: () => {},
    dataTransfer: {
      setData: (key, val) => {
        data[key] = val;
      },
      getData: key => data[key]
    }
  };
};

const runDrag = (type, data, json = true) => async (dropProps, inst) => {
  const e = createDragEvent();

  if (typeof type === 'string') {
    e.dataTransfer.setData(type, json ? JSON.stringify(data) : data);
  } else {
    // type is actually dragProps
    type.onDragStart(e);
  }

  // simulate event bubbling
  if (inst) {
    /* eslint-disable-next-line */
    inst.eventHandled = false;
  }

  dropProps.onDrop(e);

  // because inMaps are async then we just need to go to the end of the
  // task queue
  await new Promise(setTimeout);
};

const setup = jsx => TestRenderer.create(jsx).getInstance();

describe('Guration', () => {
  it('creates MOVE events from dragged nodes', async () => {
    let nodeProps;
    let dropProps;
    let edit;

    const inst = setup(
      <Root
        type="@@ROOT"
        id="@@ROOT"
        onChange={e => {
          edit = e;
        }}
      >
        <Level arr={[{ id: 1 }, { id: 2 }]} type="a">
          {(child, getNodeProps, i) => {
            if (i === 0) {
              nodeProps = getNodeProps();
            }

            return (
              <Level
                arr={[{ id: 1 }, { id: 2 }]}
                field="children"
                type="a"
                renderDrop={(getDropProps, isTarget, j) => {
                  if (j === 1) {
                    dropProps = getDropProps();
                  }
                }}
              >
                {() => null}
              </Level>
            );
          }}
        </Level>
      </Root>
    );

    await runDrag(nodeProps)(dropProps, inst);

    expect(edit.type).toEqual('MOVE');
  });

  it('creates INSERT events from mapped drops', async () => {
    let dropProps;
    let edit;

    const inst = setup(
      <Root
        type="@@ROOT"
        id="@@ROOT"
        onChange={e => {
          edit = e;
        }}
        mapIn={{
          text: str => JSON.parse(str)
        }}
      >
        <Level arr={[{ id: 2 }]} type="a">
          {() => (
            <Level
              arr={[{ id: 1 }]}
              type="a"
              field="children"
              renderDrop={getDropProps => {
                dropProps = getDropProps();
              }}
            >
              {() => null}
            </Level>
          )}
        </Level>
      </Root>
    );

    await runDrag('text', {
      type: 'a',
      id: 2
    })(dropProps, inst);

    expect(edit).toEqual({
      type: 'INSERT',
      payload: {
        type: 'a',
        id: 2,
        path: {
          parent: {
            type: 'a',
            id: 2,
            index: 0,
            childrenField: 'children'
          },
          index: 1
        }
      },
      meta: {}
    });
  });

  it('creates preserves meta from mapped drops', async () => {
    let dropProps;
    let edit;

    const inst = setup(
      <Root
        type="@@ROOT"
        id="@@ROOT"
        onChange={e => {
          edit = e;
        }}
        mapIn={{
          text: str => JSON.parse(str)
        }}
      >
        <Level arr={[{ id: 2 }]} type="a">
          {() => (
            <Level
              arr={[{ id: 1 }]}
              type="a"
              field="children"
              renderDrop={getDropProps => {
                dropProps = getDropProps();
              }}
            >
              {() => null}
            </Level>
          )}
        </Level>
      </Root>
    );

    await runDrag('text', {
      type: 'a',
      id: 2,
      meta: {
        key: 'value'
      }
    })(dropProps, inst);

    expect(edit.meta).toEqual({
      key: 'value'
    });
  });

  it('does not allow moves of a node to a subPath of that node', async () => {
    let dragProps;
    let dropProps;
    let error;

    const inst = setup(
      <Root
        type="@@ROOT"
        id="@@ROOT"
        onError={e => {
          error = e;
        }}
      >
        <Level arr={[{ id: 2 }]} type="a" field="children">
          {(child, getNodeProps) => {
            dragProps = getNodeProps();
            return (
              <Level
                arr={[]}
                field="children"
                type="a"
                renderDrop={getDropProps => {
                  dropProps = getDropProps();
                }}
              >
                {() => null}
              </Level>
            );
          }}
        </Level>
      </Root>
    );

    await runDrag(dragProps)(dropProps, inst);

    expect(error).toBeTruthy();
  });

  it('does not allow move of a node to an invalid type position', async () => {
    let dragProps;
    let dropProps;
    let error;

    const inst = setup(
      <Root
        type="@@ROOT"
        id="@@ROOT"
        onError={e => {
          error = e;
        }}
      >
        <Level arr={[{ id: 2 }]} field="children" type="a">
          {(child, getNodeProps) => {
            dragProps = getNodeProps();
            return null;
          }}
        </Level>
        <Level
          arr={[]}
          field="other"
          type="b"
          renderDrop={getDropProps => {
            dropProps = getDropProps();
          }}
        >
          {() => null}
        </Level>
      </Root>
    );

    await runDrag(dragProps)(dropProps, inst);

    expect(error).toBeTruthy();
  });

  it('adjusts move indices when moving things that affect the drop index', async () => {
    let dragProps;
    let dropProps;
    let edit;

    const inst = setup(
      <Root
        type="@@ROOT"
        id="@@ROOT"
        onChange={e => {
          edit = e;
        }}
      >
        <Level
          type="b"
          arr={[{ id: 1 }, { id: 2 }, { id: 3 }]}
          renderDrop={getDropProps => {
            dropProps = getDropProps();
          }}
        >
          {(child, getNodeProps, i) => {
            if (i === 0) {
              dragProps = getNodeProps();
            }

            return false;
          }}
        </Level>
      </Root>
    );

    await runDrag(dragProps)(dropProps, inst);

    expect(edit.payload.to.index).toBe(2);
  });

  it('does not create MOVE events when moves will have no impact', async () => {
    let dragProps;
    let dropProps;
    let edit;

    const inst = setup(
      <Root
        type="@@ROOT"
        id="@@ROOT"
        onChange={e => {
          edit = e;
        }}
      >
        <Level
          arr={[{ id: '1' }]}
          field="children"
          type="a"
          renderDrop={getDropProps => {
            dropProps = getDropProps();
          }}
        >
          {(child, getNodeProps) => {
            dragProps = getNodeProps();
            return null;
          }}
        </Level>
      </Root>
    );

    await runDrag(dragProps)(dropProps, inst);

    expect(edit).toBe(undefined);
  });

  // TODO: implement
  //   it('disallows adding more than maxChildren', async () => {
  //     let dropProps;
  //     let error;

  //     const inst = setup(
  //       <Root
  //         type="@@ROOT"
  //         id="@@ROOT"
  //         onChange={() => {}}
  //         onError={e => { error = e; }}
  //         mapIn={{
  //           text: str => JSON.parse(str)
  //         }}
  //       >
  //         <Level
  //           type="a"
  //           arr={[{ id: 1 }]}
  //           maxChildren={1}
  //           renderDrop={getDropProps => {
  //             // should be the 2nd drop after all reassignments
  //             dropProps = getDropProps();
  //           }}
  //         >
  //           {child => null}
  //         </Level>
  //       </Root>
  //     );

  //     await runDrag('text', {
  //       type: 'a',
  //       id: 2
  //     })(dropProps, inst);

  //     expect(error).toBeTruthy();
  //   });

  it('creates inserts between roots', async () => {
    let nodeProps;
    let dropProps;
    let edit;

    setup(
      <div>
        <Root
          type="@@ROOT"
          id="@@ROOT"
          mapOut={{
            share: () => 'test'
          }}
        >
          <Level type="a" arr={[{ id: 1 }]}>
            {(child, getNodeProps) => {
              nodeProps = getNodeProps();
              return null;
            }}
          </Level>
        </Root>
        <Root
          type="@@ROOT"
          id="@@ROOT"
          mapIn={{ share: text => ({ id: text, type: 'a' }) }}
          onChange={e => {
            edit = e;
          }}
        >
          <Level
            type="a"
            arr={[{ id: 1 }, { id: 2 }]}
            renderDrop={getDropProps => {
              dropProps = getDropProps();
            }}
          >
            {() => null}
          </Level>
        </Root>
      </div>
    );

    await runDrag(nodeProps)(dropProps);

    expect(edit.type).toBe('INSERT');
  });
});
