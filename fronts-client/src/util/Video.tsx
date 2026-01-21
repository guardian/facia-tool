import {
	CinemagraphIcon,
	LoopIcon,
	VideoIcon,
	YoutubeIcon,
} from '../components/icons/Icons';
import React from 'react';

export type SelfHostedVideoPlayerFormat = 'default' | 'loop' | 'cinemagraph';
export type VideoFormatType =
	| 'YouTube'
	| 'Loop'
	| 'Cinemagraph'
	| 'Non-YouTube';

export type VideoPlayerFormatInfo = {
	label: VideoFormatType;
	icon: JSX.Element;
};

export const videoPlayerFormatMap: Record<
	SelfHostedVideoPlayerFormat | 'youtube',
	VideoPlayerFormatInfo
> = {
	youtube: {
		label: 'YouTube',
		icon: <YoutubeIcon />,
	},
	loop: {
		label: 'Loop',
		icon: <LoopIcon />,
	},
	cinemagraph: {
		label: 'Cinemagraph',
		icon: <CinemagraphIcon />,
	},
	default: {
		label: 'Non-YouTube',
		icon: <VideoIcon />,
	},
};
