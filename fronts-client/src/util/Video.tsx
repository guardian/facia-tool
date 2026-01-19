import {
	CinemagraphIcon,
	LoopIcon,
	VideoIcon,
	YoutubeIcon,
} from '../components/icons/Icons';
import React from 'react';

export type SelfHostedVideoPlayerFormat = 'default' | 'loop' | 'cinemagraph';
export type VideoFormatType =
	(typeof videoPlayerFormatMap)[keyof typeof videoPlayerFormatMap]['label'];

export const videoPlayerFormatMap: Record<
	SelfHostedVideoPlayerFormat | 'youtube',
	any
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
