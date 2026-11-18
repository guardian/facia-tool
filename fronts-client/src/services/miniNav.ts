import pandaFetch from 'services/pandaFetch';
import { attemptFriendlyErrorMessage } from 'util/error';

export const getMiniNavResolutionError = (error: unknown): string => {
	if (typeof error === 'object' && error !== null && 'status' in error) {
		if (error.status === 409) {
			return 'Custom subnav is not published, and so cannot be linked';
		}
		if (error.status === 404) {
			return 'This subnav does not exist';
		}
	}
	return error instanceof Error
		? error.message
		: `Could not resolve the custom subnav: ${attemptFriendlyErrorMessage(error)}`;
};

export interface ResolvedMiniNav {
	id: string;
	title: string;
}

export const getMiniNavSubnavId = (value: string): string => {
	let url: URL;
	try {
		url = new URL(value.trim());
	} catch {
		throw new Error('Enter a valid custom subnav URL');
	}

	const match = /^\/v2\/subnavs\/([^/]+)\/?$/.exec(url.pathname);
	if (
		!['http:', 'https:'].includes(url.protocol) ||
		url.origin !== window.location.origin ||
		url.username ||
		url.password ||
		!match
	) {
		throw new Error('Enter a custom subnav URL from this Fronts tool');
	}

	return match[1];
};

export const resolveMiniNavUrl = async (
	value: string,
): Promise<ResolvedMiniNav> => {
	const id = getMiniNavSubnavId(value);
	const response = await pandaFetch(
		`/custom-subnav/${encodeURIComponent(id)}/resolve`,
	);
	return response.json();
};
