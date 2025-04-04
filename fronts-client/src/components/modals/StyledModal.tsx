import { styled } from '../../constants/theme';
import Modal from 'react-modal';
import ButtonDefault from '../inputs/ButtonDefault';

export const StyledModal = styled(Modal)`
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

export const ModalButton = styled(ButtonDefault)`
	position: absolute;
	right: 17px;
	top: 15px;
	border-radius: 50%;
	height: 27px;
	width: 27px;
`;

export const ImageContainer = styled.div`
	position: absolute;
	top: 5px;
	left: 6px;
`;
