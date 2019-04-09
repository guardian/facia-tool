import { nextClipboardIndexSelector } from 'selectors/keyboardNavigationSelectors';
import state from 'fixtures/initialState';

describe('nextClipboardIndexSelector', () => {
  const stateWithClipboard = {
    ...state,
    clipboard: ['id-1', 'id-2', 'id-3', 'id-4']
  };

  it('return null when clipboard is empty', () => {
    const stateWithEmptyClipboard = { ...state, clipboard: [] };
    expect(
      nextClipboardIndexSelector(stateWithEmptyClipboard, 'some-id', 'up')
    ).toEqual(null);
  });

  it('return null when moving top article up', () => {
    expect(
      nextClipboardIndexSelector(stateWithClipboard, 'id-1', 'up')
    ).toEqual(null);
  });

  it('return next article when moving top article up', () => {
    expect(
      nextClipboardIndexSelector(stateWithClipboard, 'id-3', 'up')
    ).toEqual({ fromIndex: 2, toIndex: 1 });
  });

  it('return null when moving bottom article down', () => {
    expect(
      nextClipboardIndexSelector(stateWithClipboard, 'id-4', 'down')
    ).toEqual(null);
  });

  it('return next article when moving bottom article down', () => {
    expect(
      nextClipboardIndexSelector(stateWithClipboard, 'id-3', 'down')
    ).toEqual({ fromIndex: 2, toIndex: 3 });
  });
});
