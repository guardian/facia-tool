import React from 'react';
import { styled } from 'constants/theme';
import { CloseIcon } from 'components/icons/Icons';
import {ImageContainer, ModalButton, StyledModal} from "./StyledModal";

interface ModalProps {
	isOpen: boolean;
	url: string;
	onClose: () => void;
	onMessage: (message: any) => void;
}

const GridIFrame = styled.iframe`
	height: 100%;
	width: 96%;
	margin-left: 2%;
	border: 0;
`;

export const GridModal = ({ isOpen, url, onMessage, onClose }: ModalProps) => (
	<React.Fragment>
		<StyledModal
			isOpen={isOpen}
			style={{
				overlay: {
					zIndex: 900,
				},
			}}
		>
			<ModalButton type="button" priority="primary" onClick={onClose}>
				<ImageContainer>
					<CloseIcon />
				</ImageContainer>
			</ModalButton>

			<GridIFrame src={url} />
		</StyledModal>
	</React.Fragment>
);
