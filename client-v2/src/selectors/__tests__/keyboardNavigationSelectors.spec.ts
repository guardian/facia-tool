import {
  nextClipboardIndexSelector,
  nextIndexAndGroupSelector
} from 'selectors/keyboardNavigationSelectors';
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

describe('nextIndexAndGroupSelector', () => {
  const groupsWithArticleFragments = {
    group1: {
      id: 'group1',
      name: 'groupname',
      uuid: 'group1',
      articleFragments: ['fragment-1', 'fragment-2', 'fragment-3']
    },
    group2: {
      id: 'group2',
      name: 'groupname',
      uuid: 'group2',
      articleFragments: ['fragment-4', 'fragment-5', 'fragment-6']
    }
  };
  const artFragments = {
    'fragment-1': {
      id: 'internal-code/page/123',
      frontPublicationDate: 1547204861924,
      meta: { supporting: [] },
      uuid: 'id-1'
    },
    'fragment-2': {
      id: 'internal-code/page/123',
      frontPublicationDate: 1547204861924,
      meta: { supporting: [] },
      uuid: 'id-2'
    },
    'fragment-3': {
      id: 'internal-code/page/123',
      frontPublicationDate: 1547204861924,
      meta: { supporting: [] },
      uuid: 'id-3'
    },
    'fragment-4': {
      id: 'internal-code/page/123',
      frontPublicationDate: 1547204861924,
      meta: { supporting: [] },
      uuid: 'id-4'
    },
    'fragment-5': {
      id: 'internal-code/page/123',
      frontPublicationDate: 1547204861924,
      meta: { supporting: [] },
      uuid: 'id-5'
    },
    'fragment-6': {
      id: 'internal-code/page/123',
      frontPublicationDate: 1547204861924,
      meta: { supporting: [] },
      uuid: 'id-6'
    }
  };
  const collections = {
    data: {
      '5a32abdf-2d1c-4f9e-a116-617e4d055ab9': {
        live: ['group1', 'group2'],
        lastUpdated: 1547202598354,
        updatedBy: 'Name Surname',
        updatedEmail: 'email@email.co.uk',
        displayName: 'headlines',
        id: '5a32abdf-2d1c-4f9e-a116-617e4d055ab9',
        type: 'fixed/small/slow-IV'
      }
    },
    pagination: null,
    lastError: null,
    error: null,
    lastFetch: null,
    loading: false,
    loadingIds: [],
    updatingIds: []
  };
  const stateWithGroups = {
    ...state,
    shared: {
      ...state.shared,
      groups: groupsWithArticleFragments,
      articleFragments: artFragments,
      collections
    }
  };

  it('return null when moving articles in an empty group', () => {
    const emptyGroups = {
      group123: {
        id: 'gobbleygook',
        name: 'groupname',
        uuid: 'group123',
        articleFragments: []
      }
    };
    const stateWithEmptyGroup = {
      ...state,
      shared: {
        ...state.shared,
        groups: emptyGroups
      }
    };
    expect(
      nextIndexAndGroupSelector(
        stateWithEmptyGroup,
        'gobbleygook',
        'some-id',
        'up'
      )
    ).toEqual(null);
  });

  it('return null when moving top article in collection', () => {
    expect(
      nextIndexAndGroupSelector(stateWithGroups, 'group1', 'fragment-1', 'up')
    ).toEqual(null);
  });

  it('return next group id and index when moving up article in collection', () => {
    expect(
      nextIndexAndGroupSelector(stateWithGroups, 'group1', 'fragment-2', 'up')
    ).toEqual({ toIndex: 0, nextGroupId: 'group1' });
  });

  it('return null when moving bottom article in collection', () => {
    expect(
      nextIndexAndGroupSelector(stateWithGroups, 'group2', 'fragment-6', 'down')
    ).toEqual(null);
  });

  it('return next group id and index when moving down article in collection', () => {
    expect(
      nextIndexAndGroupSelector(stateWithGroups, 'group1', 'fragment-2', 'down')
    ).toEqual({ toIndex: 2, nextGroupId: 'group1' });
  });

  it('return next group id when moving down between groups', () => {
    expect(
      nextIndexAndGroupSelector(stateWithGroups, 'group1', 'fragment-3', 'down')
    ).toEqual({ toIndex: 0, nextGroupId: 'group2' });
  });

  it('return next group id when moving up between groups', () => {
    expect(
      nextIndexAndGroupSelector(stateWithGroups, 'group2', 'fragment-4', 'up')
    ).toEqual({ toIndex: 3, nextGroupId: 'group1' });
  });
});