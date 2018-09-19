// @flow

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

const runDrag = (type, data, json = true) => (dropProps, inst) => {
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
};

describe('Guration', () => {
  it('creates MOVE events from dragged nodes', () => {
    let nodeProps;
    let dropProps;
    let edit;

    const inst = TestRenderer.create(
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
    ).getInstance();

    runDrag(nodeProps)(dropProps, inst);

    expect(edit.type).toEqual('MOVE');
  });

  it('creates INSERT events from mapped drops', () => {
    let dropProps;
    let edit;

    const inst = TestRenderer.create(
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
    ).getInstance();

    runDrag('text', {
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

  it('creates preservers meta from mapped drops', () => {
    let dropProps;
    let edit;

    const inst = TestRenderer.create(
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
    ).getInstance();

    runDrag('text', {
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

  it('creates MOVE events from duplicate drops', () => {
    let dropProps;
    let edit;

    const inst = TestRenderer.create(
      <Root
        type="@@ROOT"
        id="@@ROOT"
        onChange={e => {
          edit = e;
        }}
        dedupeType="a"
        mapIn={{
          text: str => JSON.parse(str)
        }}
      >
        <Level arr={[{ id: 3 }]} field="children1" type="a">
          {() => (
            <Level
              arr={[{ id: 2 }, { id: 3 }, { id: 4 }]}
              field="children2"
              type="a"
              renderDrop={(getDropProps, isTarget, i) => {
                if (i === 1) {
                  dropProps = getDropProps();
                }
              }}
            >
              {() => null}
            </Level>
          )}
        </Level>
      </Root>
    ).getInstance();

    runDrag('text', {
      type: 'a',
      id: 4
    })(dropProps, inst);

    expect(edit).toEqual({
      payload: {
        from: {
          parent: {
            childrenField: 'children2',
            id: 3,
            index: 0,
            type: 'a'
          }
        },
        id: 4,
        to: {
          parent: { id: 3, index: 0, type: 'a', childrenField: 'children2' },
          index: 1
        },
        type: 'a'
      },
      type: 'MOVE',
      meta: {}
    });
  });

  it('does not allow moves of a node to a subPath of that node', () => {
    let dragProps;
    let dropProps;
    let error;

    const inst = TestRenderer.create(
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
    ).getInstance();

    runDrag(dragProps)(dropProps, inst);

    expect(error).toBeTruthy();
  });

  it('does not allow move of a node to an invalid type position', () => {
    let dragProps;
    let dropProps;
    let error;

    const inst = TestRenderer.create(
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
    ).getInstance();

    runDrag(dragProps)(dropProps, inst);

    expect(error).toBeTruthy();
  });

  it('adjusts move indices when moving things that affect the drop index', () => {
    let dragProps;
    let dropProps;
    let edit;

    const inst = TestRenderer.create(
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
    ).getInstance();

    runDrag(dragProps)(dropProps, inst);

    expect(edit.payload.to.index).toBe(2);
  });

  it('does not create MOVE events when moves will have no impact', () => {
    let dragProps;
    let dropProps;
    let edit;

    const inst = TestRenderer.create(
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
    ).getInstance();

    runDrag(dragProps)(dropProps, inst);

    expect(edit).toBe(undefined);
  });

  // TODO: implement
  //   it('disallows adding more than maxChildren', () => {
  //     let dropProps;
  //     let error;

  //     const inst = TestRenderer.create(
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

  //     runDrag('text', {
  //       type: 'a',
  //       id: 2
  //     })(dropProps, inst);

  //     expect(error).toBeTruthy();
  //   });

  it('creates inserts between roots', () => {
    let nodeProps;
    let dropProps;
    let edit;

    TestRenderer.create(
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

    runDrag(nodeProps)(dropProps);

    expect(edit.type).toBe('INSERT');
  });
});
