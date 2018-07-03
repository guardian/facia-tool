// @flow

import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import fetchMock from 'fetch-mock';
import config from 'fixtures/config';
import { stateWithCollection } from 'shared/fixtures/shared';
import { actions as collectionActions } from 'shared/bundles/collectionsBundle';
import { updateCollection } from '../Collections';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

describe('Collection actions', () => {
  const { now } = Date;
  afterEach(fetchMock.restore);
  beforeAll(() => {
    (Date: any).now = () => 1337;
  });
  afterAll(() => {
    (Date: any).now = now;
  });
  describe('Update collection thunk', () => {
    it('should issue a collection update', async () => {
      const collection: any =
        stateWithCollection.shared.collections.data.exampleCollection;
      fetchMock.once('/v2Edits', collection, {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST'
      });
      const store = mockStore({
        config,
        ...stateWithCollection
      });
      await store.dispatch(updateCollection(collection));
      const actions = store.getActions();
      expect(actions[0].payload[0]).toEqual(
        collectionActions.updateStart({
          ...collection,
          updatedEmail: 'jonathon.herbert@guardian.co.uk',
          updatedBy: 'Jonathon Herbert',
          lastUpdated: 1337
        })
      );
      expect(actions[0].payload[1]).toEqual({
        type: 'RECORD_UNPUBLISHED_CHANGES',
        payload: { exampleCollection: true }
      });
      expect(actions[1]).toEqual(
        collectionActions.updateSuccess('exampleCollection')
      );
    });
  });
});
