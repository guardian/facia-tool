import type { Action } from 'types/Action';
import { OptionsModalProps } from 'types/Modals';

const optionsModal = (state: OptionsModalProps, action: Action) => {
	switch (action.type) {
		case 'MODAL/START_OPTIONS_MODAL': {
			return action.payload;
		}
		case 'MODAL/END_OPTIONS_MODAL': {
			return null;
		}
		default: {
			return state;
		}
	}
};
export default optionsModal;
