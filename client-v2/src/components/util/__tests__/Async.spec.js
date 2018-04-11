// @flow

import React from 'react';
import { shallow } from 'enzyme';
import Async from '../Async';

const makePromise = (val, err) =>
  new Promise((res, rej) => (err ? rej(val) : res(val)));

describe('Async', () => {
  it('renders null before the promise has resolved', async () => {
    let v;
    let p;
    let e;
    const promise = makePromise('hi');
    shallow(
      <Async fn={() => promise}>
        {({ value, pending, error }) => {
          v = value;
          p = pending;
          e = error;
        }}
      </Async>
    );
    expect([v, p, e]).toEqual([null, true, null]);
    await promise;
    expect([v, p, e]).toEqual(['hi', false, null]);
  });

  it('recomputes when changing functions', async () => {
    let v;
    let p;
    let e;
    const promise = makePromise('hi');
    const promise2 = makePromise('hi2');
    const wrapper = shallow(
      <Async fn={() => promise}>
        {({ value, pending, error }) => {
          v = value;
          p = pending;
          e = error;
        }}
      </Async>
    );
    await promise;
    wrapper.setProps({
      fn: () => promise2
    });
    expect([v, p, e]).toEqual(['hi', true, null]);
    await promise2;
    expect([v, p, e]).toEqual(['hi2', false, null]);
  });

  it('passes arguments correctly', async () => {
    let arg;
    const promise = makePromise('hi');
    shallow(
      <Async
        fn={a => {
          arg = a;
          return promise;
        }}
        args={['arg1']}
      >
        {() => false}
      </Async>
    );
    expect(arg).toEqual('arg1');
  });

  it('recomputes when changing arguments', async () => {
    let v;
    let p;
    let e;
    const promise = makePromise('hi');
    const promise2 = makePromise('hi2');
    const wrapper = shallow(
      <Async fn={a => (a ? promise : promise2)} args={[true]}>
        {({ value, pending, error }) => {
          v = value;
          p = pending;
          e = error;
        }}
      </Async>
    );
    await promise;
    wrapper.setProps({
      args: [false]
    });
    expect([v, p, e]).toEqual(['hi', true, null]);
    await promise2;
    expect([v, p, e]).toEqual(['hi2', false, null]);
  });

  it('shows loading state between updates if intermediateLoadState is set', async () => {
    let v;
    let p;
    let e;
    const promise = makePromise('hi');
    const wrapper = shallow(
      <Async fn={() => promise} intermediateLoadState args={['arg1']}>
        {({ value, pending, error }) => {
          v = value;
          p = pending;
          e = error;
        }}
      </Async>
    );
    await promise;
    wrapper.setProps({
      args: ['arg2']
    });
    expect([v, p, e]).toEqual(['hi', true, null]);
    await promise;
    expect([v, p, e]).toEqual(['hi', false, null]);
    wrapper.setProps({
      fn: () => promise
    });
    expect([v, p, e]).toEqual(['hi', true, null]);
    await promise;
    expect([v, p, e]).toEqual(['hi', false, null]);
  });

  it("doesn't recompute when keeping the same function", async () => {
    let v;
    let p;
    let e;
    const promise = makePromise('hi');
    const promisefn = () => promise;
    const wrapper = shallow(
      <Async fn={promisefn}>
        {({ value, pending, error }) => {
          v = value;
          p = pending;
          e = error;
        }}
      </Async>
    );
    await promise;
    wrapper.setProps({
      fn: promisefn
    });
    expect([v, p, e]).toEqual(['hi', false, null]);
  });

  it("doesn't recompute when keeping the same args", async () => {
    let v;
    let p;
    let e;
    const promise = makePromise('hi');
    const promisefn = () => promise;
    const wrapper = shallow(
      <Async fn={promisefn} args={['arg1']}>
        {({ value, pending, error }) => {
          v = value;
          p = pending;
          e = error;
        }}
      </Async>
    );
    await promise;
    wrapper.setProps({
      args: ['arg1']
    });
    expect([v, p, e]).toEqual(['hi', false, null]);
  });

  it("doesn't call run the fn if on is specified", async () => {
    let v;
    let p;
    let e;
    const promise = makePromise('hi');
    const promisefn = () => promise;
    shallow(
      <Async fn={promisefn} args={['arg1']} on={false}>
        {({ value, pending, error }) => {
          v = value;
          p = pending;
          e = error;
        }}
      </Async>
    );
    expect([v, p, e]).toEqual([null, false, null]);
    await promise;
    expect([v, p, e]).toEqual([null, false, null]);
  });
});
