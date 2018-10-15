

import React from 'react';
import { mount } from 'enzyme';
import { SearchQueryWithoutContext as SearchQuery } from '../SearchQuery';

const succesfulReturn = {
  response: {
    results: [{ webTitle: 'hi' }]
  }
};

const flushPromises = () => new Promise(resolve => process.nextTick(resolve));

describe('SearchQuery', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => succesfulReturn
      })
    );
  });

  it('renders false before the promise has resolved', async () => {
    let v;
    let p;
    let e;
    const baseURL = 'https://www.example.com';
    mount(
      <SearchQuery baseURL={baseURL}>
        {({ value, pending, error }) => {
          v = value;
          p = pending;
          e = error;
          return false;
        }}
      </SearchQuery>
    );
    expect([v, p, e]).toEqual([null, true, null]);
  });

  it('makes a call and passes that too the child when the API returns', async () => {
    let v;
    let p;
    let e;
    const baseURL = 'https://www.example.com';
    mount(
      <SearchQuery baseURL={baseURL}>
        {({ value, pending, error }) => {
          v = value;
          p = pending;
          e = error;
          return false;
        }}
      </SearchQuery>
    );
    await flushPromises();
    expect(global.fetch.mock.calls[0][0].includes(baseURL)).toBe(true);
    expect([v, p, e]).toEqual([succesfulReturn, false, null]);
  });
});
