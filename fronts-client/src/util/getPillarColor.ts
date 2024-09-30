import { theme } from 'constants/theme';

const pillarColorMap = {
	'pillar/news': '#c70000',
	'pillar/sport': '#0084c6',
	'pillar/opinion': '#e05e00',
	'pillar/lifestyle': '#bb3b80',
	'pillar/arts': '#a1845c',
} as { [pillar: string]: string };

const noPillarColour = '#221133';
const deadLiveBlogColour = theme.colors.greyMediumDark;

export const notLiveColour = '#ff7f0f';

export const getPillarColor = (
	pillar: string | undefined,
	isLive: boolean,
	deadLiveBlog?: boolean,
) => {
	if (!isLive) {
		return notLiveColour;
	}

	if (deadLiveBlog) {
		return deadLiveBlogColour;
	}

	if (!pillar) {
		return noPillarColour;
	}

	return pillarColorMap[pillar];
};
