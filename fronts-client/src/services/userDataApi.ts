import type { FeatureSwitch } from 'types/Features';
import type { NestedCard } from 'types/Collection';
import pandaFetch from './pandaFetch';
import { attemptFriendlyErrorMessage } from 'util/error';

const saveFeatureSwitch = async (featureSwitch: FeatureSwitch) => {
	try {
		await pandaFetch('/userdata/featureSwitch', {
			method: 'put',
			body: JSON.stringify(featureSwitch),
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json',
			},
		});
	} catch (e) {
		throw new Error(
			`Tried to persist feature switch, but the server responded with ${attemptFriendlyErrorMessage(
				e,
			)}`,
		);
	}
};

async function saveOpenFrontIds(frontsByPriority?: {
	[priority: string]: string[];
}): Promise<void> {
	try {
		await pandaFetch(`/userdata/frontIdsByPriority`, {
			method: 'put',
			credentials: 'same-origin',
			body: JSON.stringify(frontsByPriority),
			headers: {
				'Content-Type': 'application/json',
			},
		});
	} catch (e) {
		throw new Error(
			`Tried to store the open fronts configuration but the server responded with ${attemptFriendlyErrorMessage(
				e,
			)}`,
		);
	}
}

async function saveFavouriteFrontIds(favouriteFrontsByPriority?: {
	[priority: string]: string[];
}): Promise<void> {
	try {
		await pandaFetch(`/userdata/favouriteFrontIdsByPriority`, {
			method: 'put',
			credentials: 'same-origin',
			body: JSON.stringify(favouriteFrontsByPriority),
			headers: {
				'Content-Type': 'application/json',
			},
		});
	} catch (e) {
		throw new Error(
			`Tried to store the favourite fronts configuration but the server responded with ${attemptFriendlyErrorMessage(
				e,
			)}`,
		);
	}
}

async function saveClipboard(
	clipboardContent: NestedCard[],
): Promise<NestedCard[]> {
	// The server does not respond with JSON
	try {
		const response = await pandaFetch(`/userdata/clipboard`, {
			method: 'put',
			credentials: 'same-origin',
			body: JSON.stringify(clipboardContent),
			headers: {
				'Content-Type': 'application/json',
			},
		});
		return await response.json();
	} catch (e) {
		throw new Error(
			`Tried to update a clipboard but the server responded with ${attemptFriendlyErrorMessage(
				e,
			)}`,
		);
	}
}

export {
	saveClipboard,
	saveFavouriteFrontIds,
	saveOpenFrontIds,
	saveFeatureSwitch,
};
