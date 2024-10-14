import type { StartOptionsModal } from 'types/Action';
import type { OptionsModalChoices } from 'types/Modals';
import { ReactNode } from 'react';
import noop from 'lodash/noop';

const startOptionsModal = (
	title: string,
	description: string | ReactNode,
	options: OptionsModalChoices[] = [],
	onCancel: () => void = noop,
	showCancelButton: boolean = true,
): StartOptionsModal => ({
	type: 'MODAL/START_OPTIONS_MODAL',
	payload: {
		title,
		description,
		options,
		onCancel,
		showCancelButton,
		isOpen: true,
	},
});

const endOptionsModal = () => ({
	type: 'MODAL/END_OPTIONS_MODAL' as const,
});

export { startOptionsModal, endOptionsModal };
