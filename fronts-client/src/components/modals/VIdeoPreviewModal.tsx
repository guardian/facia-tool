import React from 'react';
import { ImageContainer, ModalButton, StyledModal } from './StyledModal';
import { CloseIcon } from '../icons/Icons';
import { styled } from '../../constants/theme';

type VideoPreviewModalProps = {
	isOpen: boolean;
	url: string | undefined;
	onClose: () => void;
};

const VideoPreviewIFrame = styled.iframe`
	height: 100%;
	width: 95%;
	margin-left: 2%;
	border: 0;
`;

export const VideoPreviewModal = ({
	isOpen,
	url,
	onClose,
}: VideoPreviewModalProps) => {
	if (!url) return null;

	return (
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
				<VideoPreviewIFrame
					// TODO: handle self-hosted videos
					src={`https://www.youtube.com/embed/${url}`}
				></VideoPreviewIFrame>
			</StyledModal>
		</React.Fragment>
	);
};
