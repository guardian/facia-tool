import GridUtil from 'grid-util-js';
import urlConstants from 'constants/url';

class Grid {
	public instance = new GridUtil({
		apiBaseUrl: urlConstants.media.apiBaseUrl,
		fetchInit: {
			credentials: 'include',
			mode: 'cors',
		},
	});

	get gridInstance() {
		return this.instance;
	}

	public setGridInstance(instance: typeof GridUtil) {
		this.instance = instance;
	}
}

const grid = new Grid();

export function recordUsage(mediaId: string, frontId?: string) {
	const usageData = {
		mediaId,
		front: frontId,
	};

	return fetch(urlConstants.media.usageBaseUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(usageData),
	});
}

export default grid;
