import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { stateWithCollection } from 'shared/fixtures/shared';
import config from 'fixtures/config';
import {
  persistCollectionOnEdit,
  persistOpenFrontsOnEdit,
  persistFaveFrontsOnEdit
} from '../storeMiddleware';
import { Collection } from 'shared/types/Collection';

const mockCollectionUpdateAction: any = (collection: Collection) => ({
  type: 'UPDATE_COLLECTION',
  collection
});

let mockStore: any;

const state = {
  ...stateWithCollection,
  config
};

describe('Store middleware', () => {
  describe('persistCollectionOnEdit', () => {
    beforeEach(() => {
      mockStore = configureStore([
        thunk,
        persistCollectionOnEdit(mockCollectionUpdateAction)
      ]);
    });
    it('should do nothing for actions without the correct persistTo property in the action meta', () => {
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
          live: ['abc', 'def'],
          draft: [],
          previously: undefined,
          type: 'type'
        })
      );
    });
  });

  describe('persistOpenFrontsOnEdit', () => {
    let persistFrontIdsSpy: any;
    beforeEach(() => {
      persistFrontIdsSpy = jest.fn();
      mockStore = configureStore([
        thunk,
        persistOpenFrontsOnEdit(persistFrontIdsSpy)
      ]);
    });
    it('should do nothing for actions without the correct persistTo property in the action meta', () => {
      const store = mockStore();
      store.dispatch({
        type: 'ARBITRARY_ACTION'
      });
      expect(persistFrontIdsSpy.mock.calls.length).toBe(0);
    });
    it("should call the persist function with the state's open front ids if it receives an action the correct persistTo property", () => {
      const store = mockStore({
        editor: { frontIdsByPriority: { editorial: ['front1', 'front2'] } },
        fronts: {
          frontsConfig: {
            data: {
              fronts: {
                front1: {},
                front2: {}
              }
            }
          }
        }
      });
      store.dispatch({
        type: 'ARBITRARY_ACTION',
        meta: {
          persistTo: 'openFrontIds'
        }
      });
      expect(persistFrontIdsSpy.mock.calls.length).toBe(1);
      expect(persistFrontIdsSpy.mock.calls[0][0]).toEqual({
        editorial: ['front1', 'front2']
      });
    });
    it('should not include fronts that are no longer in the state', () => {
      const store = mockStore({
        editor: {
          frontIdsByPriority: { editorial: ['front1', 'front2', 'notInState'] }
        },
        fronts: {
          frontsConfig: {
            data: {
              fronts: {
                front1: {},
                front2: {}
              }
            }
          }
        }
      });
      store.dispatch({
        type: 'ARBITRARY_ACTION',
        meta: {
          persistTo: 'openFrontIds'
        }
      });
      expect(persistFrontIdsSpy.mock.calls.length).toBe(1);
      expect(persistFrontIdsSpy.mock.calls[0][0]).toEqual({
        editorial: ['front1', 'front2']
      });
    });
  });

  describe('persistFaveFrontsOnEdit', () => {
    let persistFaveFrontIdsSpy: any;
    beforeEach(() => {
      persistFaveFrontIdsSpy = jest.fn();
      mockStore = configureStore([
        thunk,
        persistFaveFrontsOnEdit(persistFaveFrontIdsSpy)
      ]);
    });
    it('should do nothing for actions without the correct persistTo property in the action meta', () => {
      const store = mockStore();
      store.dispatch({
        type: 'ARBITRARY_ACTION'
      });
      expect(persistFaveFrontIdsSpy.mock.calls.length).toBe(0);
    });
    it("should call the persist function with the state's fave front ids if it receives an action the correct persistTo property", () => {
      const store = mockStore({
        editor: { faveFrontIdsByPriority: { editorial: ['front1', 'front2'] } }
      });
      store.dispatch({
        type: 'ARBITRARY_ACTION',
        meta: {
          persistTo: 'faveFrontIds'
        }
      });
      expect(persistFaveFrontIdsSpy.mock.calls.length).toBe(1);
      expect(persistFaveFrontIdsSpy.mock.calls[0][0]).toEqual({
        editorial: ['front1', 'front2']
      });
    });
  });
});
