import Modal from 'react-modal';
import { ReactElement, ReactNode } from 'react';

type StyledModalProps = Modal.Props & {
	width?: number;
};

interface OptionsModalChoices {
	buttonText: string;
	callback: () => void;
}

interface OptionsModalProps {
	title: string;
	description: string | ReactNode | ReactElement<{ onCancel: () => void }>;
	isOpen: boolean;
	options: OptionsModalChoices[];
	onCancel: () => void;
	showCancelButton: boolean;
}

interface OptionsModalBodyProps {
	onCancel: () => void;
}

export {
	StyledModalProps,
	OptionsModalProps,
	OptionsModalChoices,
	OptionsModalBodyProps,
};
