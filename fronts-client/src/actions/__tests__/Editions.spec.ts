import {
  apiResponse,
  finalState,
  initialState,
} from './fixtures/Editions.fixture';
import { addFrontCollection } from '../Editions';
import configureStore from '../../util/configureStore';
import { Dispatch } from '../../types/Store';
import fetchMock from 'fetch-mock';

jest.mock('uuid/v4', () => () => 'uuid');
describe('Add new collection feature', () => {
  const { now } = Date;
  afterEach(fetchMock.restore);
  beforeAll(() => {
    (Date as any).now = () => 1337;
  });
  afterAll(() => {
    (Date as any).now = now;
  });

  it('should add new collection in the front', async () => {
    const store = configureStore(
      initialState,
      '/v2/issues/ae2035fa-7864-4c73-aabd-70ab70526bf7'
    );
    const frontId = '48bbbb7d-357f-4a07-9dac-646d6965cec2';

    fetchMock.once(`/editions-api/fronts/${frontId}/collection`, apiResponse, {
      method: 'PUT',
    });
    await (store.dispatch as Dispatch)(addFrontCollection(frontId));

    const state = store.getState();
    expect(state).toEqual(finalState);
  });
});