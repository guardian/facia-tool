import pandaFetch from 'services/pandaFetch';
import { attemptFriendlyErrorMessage } from 'util/error';
import {
	CustomSubnav,
	CustomSubnavConfig,
	CustomSubnavConfigResponse,
} from './types';

const baseUrl = '/custom-subnav';

export async function fetchSubnavConfig(): Promise<CustomSubnavConfigResponse> {
	try {
		const response = await pandaFetch(baseUrl, {
			method: 'get',
			credentials: 'same-origin',
		});
		return await response.json();
	} catch (e) {
		throw new Error(
			`Tried to fetch custom subnavs, but the server responded with ${attemptFriendlyErrorMessage(
				e,
			)}`,
		);
	}
}

export async function upsertSubnav(
	subnav: CustomSubnav,
): Promise<CustomSubnavConfig> {
	try {
		const response = await pandaFetch(`${baseUrl}/${subnav.id}`, {
			method: 'put',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'same-origin',
			body: JSON.stringify(subnav),
		});
		return await response.json();
	} catch (e) {
		throw new Error(
			`Tried to save custom subnav with id ${subnav.id}, but the server responded with ${attemptFriendlyErrorMessage(
				e,
			)}`,
		);
	}
}

export async function publishSubnav(id: string): Promise<CustomSubnavConfig> {
	return mutateSubnav('post', `${baseUrl}/${id}/publish`, id, 'publish');
}

export async function discardSubnav(id: string): Promise<CustomSubnavConfig> {
	return mutateSubnav(
		'post',
		`${baseUrl}/${id}/discard`,
		id,
		'discard changes to',
	);
}

export async function unpublishSubnav(id: string): Promise<CustomSubnavConfig> {
	return mutateSubnav('post', `${baseUrl}/${id}/unpublish`, id, 'take down');
}

export async function deleteSubnav(id: string): Promise<CustomSubnavConfig> {
	return mutateSubnav('delete', `${baseUrl}/${id}`, id, 'delete');
}

async function mutateSubnav(
	method: string,
	url: string,
	id: string,
	action: string,
): Promise<CustomSubnavConfig> {
	try {
		const response = await pandaFetch(url, {
			method,
			credentials: 'same-origin',
		});
		return await response.json();
	} catch (e) {
		throw new Error(
			`Tried to ${action} custom subnav with id ${id}, but the server responded with ${attemptFriendlyErrorMessage(
				e,
			)}`,
		);
	}
}
