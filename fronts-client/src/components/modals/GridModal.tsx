import React from 'react';
import Modal from 'react-modal';
import { styled } from 'constants/theme';
import ButtonDefault from 'components/inputs/ButtonDefault';
import { CloseIcon } from 'components/icons/Icons';

interface ModalProps {
	isOpen: boolean;
	url: string;
	onClose: () => void;
	onMessage: (message: any) => void;
}

const StyledModal = styled(Modal)`
	position: absolute;
	font-size: 14px;
	overflow: auto;
	outline: none;
	padding: 20px;
	min-height: 200px;
	width: 100%;
	height: 100%;
	background: rgba(0, 0, 0, 0.8);
`;

const ModalButton = styled(ButtonDefault)`
	position: absolute;
	right: 17px;
	top: 15px;
	border-radius: 50%;
	height: 27px;
	width: 27px;
`;

const GridIFrame = styled.iframe`
	height: 100%;
	width: 96%;
	margin-left: 2%;
	border: 0;
`;

const ImageContainer = styled.div`
	position: absolute;
	top: 5px;
	left: 6px;
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
