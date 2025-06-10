import { styled } from '../../constants/theme';
import { InfoIcon, LoopIcon, VideoIcon } from '../icons/Icons';
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
	display: flex;
	flex-direction: column;
	gap: 12px;
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
						<div>
							<VideoIcon fill={'white'} />
						</div>
						Before a Youtube video is played, we show the card's Trail Image. If
						no Trail Image exists, we show the Poster Image.
					</div>

					<div>
						<div>
							<LoopIcon fill={'white'} size={'s'} />
						</div>
						Videos which are self-hosted will loop.
					</div>
				</TooltipModal>
			) : null}
		</Container>
	);
};
