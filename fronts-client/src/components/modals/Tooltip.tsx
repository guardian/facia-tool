import { styled } from '../../constants/theme';
import {
	CinemagraphIcon,
	InfoIcon,
	LoopIcon,
	VideoIcon,
	YoutubeIcon,
} from '../icons/Icons';
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
							<YoutubeIcon fill={'white'} size={'s'} />
						</div>
						YouTube videos can be used on any non-feature card, except for XS
						cards.
					</div>
					<div>
						<div>
							<LoopIcon fill={'white'} size={'s'} />
						</div>
						Loops can be used on any non-feature card which is Large, Boosted or
						Splash.
					</div>
					<div>
						<div>
							<CinemagraphIcon fill={'white'} size={'s'} />
						</div>
						Cinemagraphs can be used on any card which is Large, Boosted or
						Splash.
					</div>
					<div>
						<div>
							<VideoIcon fill={'white'} size={'s'} />
						</div>
						Non-YouTube videos cannot be used on Fronts.
					</div>
				</TooltipModal>
			) : null}
		</Container>
	);
};
