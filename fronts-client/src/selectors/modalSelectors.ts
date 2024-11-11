import type { State } from 'types/State';
import { OptionsModalChoices } from 'types/Modals';

export const selectOptionsModalIsOpen = (state: State) => !!state.optionsModal;

export const selectOptionsModalTitle = ({ optionsModal }: State) =>
	optionsModal ? optionsModal.title : '';

export const selectOptionsModalDescription = ({ optionsModal }: State) =>
	optionsModal ? optionsModal.description : '';

const defaultOptionsArray: OptionsModalChoices[] = [];

export const selectOptionsModalOptions = ({ optionsModal }: State) =>
	optionsModal ? optionsModal.options : defaultOptionsArray;

export const selectOptionsModalShowCancelButton = ({ optionsModal }: State) =>
	optionsModal ? optionsModal.showCancelButton : true;
