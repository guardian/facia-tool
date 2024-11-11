import reducer from '../frontsReducer';
import { fetchLastPressedSuccess } from '../../actions/Fronts';

describe('Fronts actions/reducer', () => {
	describe('FRONTS_CONFIG_RECEIVED', () => {});
	describe('FETCH_LAST_PRESSED_SUCCESS', () => {
		it('should update the state with the last press date for the given front', () => {
			const newState = reducer(
				undefined,
				fetchLastPressedSuccess('exampleId', '2018-05-24T09:42:20.580Z'),
			);
			expect(newState.lastPressed.exampleId).toBe('2018-05-24T09:42:20.580Z');
		});
	});
});
