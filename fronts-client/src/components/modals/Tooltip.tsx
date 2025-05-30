import { styled } from '../../constants/theme';
import { InfoIcon, VideoIcon } from '../icons/Icons';
import React from 'react';

const TooltipModal = styled.div`
	position: absolute;
	width: 200px;
	bottom: 20px;
	transform: translateX(calc(-50% + 7px));
	background-color: black;
	color: white;
	border-radius: 4px;
	z-index: 2;
	font-size: 10px;
	font-family: TS3TextSans, 'Helvetica Neue', Helvetica, Arial, sans-serif;
	padding: 6px;
	line-height: 14px;
`;

const InfoIconContainer = styled.div`
	cursor: pointer;
`;

const Container = styled.div`
	position: relative;
	line-height: 14px;
`;

export default () => {
	const [showModal, setShowModal] = React.useState(false);

	const handleMouseEnter = (e: React.MouseEvent) => {
		e.stopPropagation();
		setShowModal(true);
	};

	const handleMouseLeave = (e: React.MouseEvent) => {
		e.stopPropagation();
		setShowModal(false);
	};

	return (
		<Container>
			<InfoIconContainer
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
			>
				<InfoIcon fill={'black'} size={'s'} />
			</InfoIconContainer>
			{showModal ? (
				<TooltipModal>
					<div>
						<VideoIcon fill={'white'} />
					</div>
					Before the Video is played, we show its Trail Image. If no Trail Image
					exists, we show its Poster Image.
				</TooltipModal>
			) : null}
		</Container>
	);
};
