import { reducer, setFocusState, resetFocusState } from '../focusBundle';

describe('focusBundle', () => {
	describe('action handlers', () => {
		describe('SET_FOCUS_STATE', () => {
			it('should replace the focus state', () => {
				expect(
					reducer(undefined, setFocusState({ type: 'clipboard' })),
				).toEqual({
					focusState: { type: 'clipboard' },
				});
			});
		});
		describe('RESET_FOCUS_STATE', () => {
			it('should reset the focus state', () => {
				expect(
					reducer({ focusState: { type: 'clipboard' } }, resetFocusState()),
				).toEqual({
					focusState: undefined,
				});
			});
		});
	});
});
