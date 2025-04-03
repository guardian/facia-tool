import {CloseIcon} from "../icons/Icons";
import React from "react";
import {ImageContainer, ModalButton, StyledModal} from "./StyledModal";
import {styled} from "../../constants/theme";


type MediaAtomMakerModalProps = {
	isOpen: boolean;
	url: string | undefined;
	onClose: () => void;
}

const MediaAtomMakerIFrame = styled.iframe`
	height: 100%;
	width: 95%;
	margin-left: 2%;
	border: 0;
`;

export const MediaAtomMakerModal = ({ isOpen, url, onClose }: MediaAtomMakerModalProps) => {
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
				<ModalButton
					type="button"
					priority="primary"
					onClick={onClose}
				>
					<ImageContainer>
						<CloseIcon/>
					</ImageContainer>
				</ModalButton>
				<MediaAtomMakerIFrame
					src={url}
				></MediaAtomMakerIFrame>
			</StyledModal>
		</React.Fragment>
	);
}
