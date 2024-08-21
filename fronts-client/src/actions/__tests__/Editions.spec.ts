import {apiResponse, finalState, initialState} from "./fixtures/Editions.fixture";
import {addFrontCollection} from "../Editions";
import configureStore from "../../util/configureStore";
import {Dispatch} from "../../types/Store";
import fetchMock from "fetch-mock";

jest.mock('uuid/v4', () => () => 'uuid');
it('reducers', async () => {
  const store = configureStore(initialState);
  const frontId = "48bbbb7d-357f-4a07-9dac-646d6965cec2";

  fetchMock.once(`/editions-api/fronts/${frontId}/collection`, apiResponse, {
    //headers: {'Content-type': 'application/json'},
    method: 'PUT',
  });
  await (store.dispatch as Dispatch)(addFrontCollection(frontId))

  const state = store.getState()
  expect(state).toEqual(finalState);
});
