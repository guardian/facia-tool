import { state as initialState } from 'fixtures/initialState';
import { State } from 'types/State';

const state = {
  ...initialState,
  path: '/v2/issues/something',
} as State;

export default state;
