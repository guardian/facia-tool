// @flow

import deepGet from '../deepGet';

const object = {
  a: {
    really: {
      deeply: {
        nested: 'string'
      }
    }
  }
}

describe('deepGet', () => {
  it('gets properties from objects', () => {
    expect(deepGet(object, ['a'])).toEqual({ really: {deeply: { nested: 'string' }}})
    expect(deepGet(object, ['a', 'really'])).toEqual({ deeply: { nested: 'string' }})
    expect(deepGet(object, ['a', 'really', 'deeply'])).toEqual({ nested: 'string' })
    expect(deepGet(object, ['a', 'really', 'deeply', 'nested'])).toEqual('string')
  });
  it('handles cases where the property doesn\'t exist', () => {
    expect(deepGet(object, ['not', 'legit'])).toEqual(null);
  });
});