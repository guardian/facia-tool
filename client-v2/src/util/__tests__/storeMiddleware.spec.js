// @flow

import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { stateWithCollection } from 'shared/fixtures/shared';
import config from 'fixtures/config';
import { persistCollectionOnEdit } from '../storeMiddleware';

const mockCollectionUpdateAction = collection => ({
  type: 'UPDATE_COLLECTION',
  collection
});
const middlewares = [
  thunk,
  persistCollectionOnEdit(mockCollectionUpdateAction)
];
const mockStore = configureStore(middlewares);

const state = {
  ...stateWithCollection,
  config
};

describe('Store middleware', () => {
  describe('persistCollectionOnEdit', () => {
    it('should do nothing for actions without persistTo in the action meta', () => {
      const store = mockStore(state);
      store.dispatch({
        type: 'ARBITRARY_ACTION'
      });
      expect(store.getActions().length).toBe(1);
    });
    it('should issue updates for the relevant collection', () => {
      const store = mockStore(state);
      store.dispatch({
        type: 'DO_SOMETHING_TO_AN_ARTICLE_FRAGMENT',
        payload: {
          id: 'exampleCollection',
          articleFragmentId: '95e2bfc0-8999-4e6e-a359-19960967c1e0',
          browsingStage: 'live'
        },
        meta: {
          persistTo: 'collection',
          key: 'articleFragmentId'
        }
      });
      expect(store.getActions()[1]).toEqual(
        mockCollectionUpdateAction({
          id: 'exampleCollection',
          displayName: 'Example Collection',
          live: ['abc'],
          draft: [],
          previously: undefined
        })
      );
    });
  });
});
