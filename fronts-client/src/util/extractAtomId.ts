import urlConstants from '../constants/url';

const stripQueryParams = (url: string): string => {
	const u = new URL(url);
	u.search = '';
	return u.toString();
};

const extractAtomId = (src: string | undefined): string => {
	if (src === undefined) {
		return '';
	}

	if (
		src.includes(urlConstants.media.videoBaseUrl) &&
		src.includes('/videos/')
	) {
		return src.split('/videos/')[1] || '';
	}

	if (src.includes(urlConstants.base.capi) && src.includes('/atom/video/')) {
		return stripQueryParams(src).split('/atom/video/')[1] || '';
	}

	return '';
};

export { extractAtomId };
