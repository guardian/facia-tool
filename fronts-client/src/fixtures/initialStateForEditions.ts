import { state as initialState } from 'fixtures/initialState';
import type { State } from 'types/State';

const state = {
	...initialState,
	path: '/v2/issues/something',
} as State;

export default state;
