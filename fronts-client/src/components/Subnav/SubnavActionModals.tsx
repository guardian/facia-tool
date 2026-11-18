import React from 'react';
import { css } from '@emotion/react';
import { Modal, Dialog } from '@guardian/stand/Modal';
import { Button } from '@guardian/stand/Button';

const dialogStyle = css`
	outline: none;
`;

interface ConfirmModalProps {
	isOpen: boolean;
	onOpenChange: (isOpen: boolean) => void;
	headerText: string;
	onConfirm: () => void;
}

export const UnpublishSubnavModal = ({
	isOpen,
	onOpenChange,
	headerText,
	onConfirm,
}: ConfirmModalProps) => (
	<Modal isDismissable isOpen={isOpen} onOpenChange={onOpenChange}>
		<Dialog cssOverrides={dialogStyle}>
			<Dialog.Header>Unpublish this {headerText} subnav</Dialog.Header>
			<Dialog.Content>
				This subnav will no longer be visible on web and app
			</Dialog.Content>
			<Dialog.Buttons>
				<Button
					variant="secondary"
					size="sm"
					onPress={() => onOpenChange(false)}
				>
					Cancel
				</Button>
				<Button
					variant="primary"
					size="sm"
					onPress={() => {
						onOpenChange(false);
						onConfirm();
					}}
				>
					Unpublish
				</Button>
			</Dialog.Buttons>
		</Dialog>
	</Modal>
);

export const DeleteSubnavModal = ({
	isOpen,
	onOpenChange,
	headerText,
	onConfirm,
}: ConfirmModalProps) => (
	<Modal isDismissable isOpen={isOpen} onOpenChange={onOpenChange}>
		<Dialog cssOverrides={dialogStyle}>
			<Dialog.Header>Delete this {headerText} subnav</Dialog.Header>
			<Dialog.Content>
				Deleting this subnav will remove it completely
			</Dialog.Content>
			<Dialog.Buttons>
				<Button
					variant="secondary"
					size="sm"
					onPress={() => onOpenChange(false)}
				>
					Cancel
				</Button>
				<Button
					variant="primary"
					size="sm"
					onPress={() => {
						onOpenChange(false);
						onConfirm();
					}}
				>
					Confirm delete
				</Button>
			</Dialog.Buttons>
		</Dialog>
	</Modal>
);
