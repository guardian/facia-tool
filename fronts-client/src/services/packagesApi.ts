import pandaFetch from './pandaFetch';
import { liveRecipes } from './recipeQuery';
import { liveCapi } from './capiQuery';
import { attemptFriendlyErrorMessage } from 'util/error';
import type {
	CreatePackageRequest,
	FeastPackage,
	FeastPackageHeader,
	FeastPackageMetadata,
	PackageItem,
	PackageItemDisplay,
	WritePackageRequest,
} from 'types/Packages';

const jsonHeaders = {
	'Content-Type': 'application/json',
};

export const getHttpStatus = (error: unknown): number | undefined => {
	if (typeof error !== 'object' || error === null) {
		return undefined;
	}

	const candidate = error as {
		status?: unknown;
		statusCode?: unknown;
		response?: { status?: unknown };
	};

	const status =
		candidate.status ?? candidate.statusCode ?? candidate.response?.status;

	return typeof status === 'number' ? status : undefined;
};

export async function fetchPackages(
	title: string,
	signal?: AbortSignal,
): Promise<FeastPackageHeader[]> {
	const params = new URLSearchParams({
		type: 'Feast',
		limit: '20',
		order: 'updated',
	});

	if (title.trim()) {
		params.set('title', title.trim());
	}

	const response = await pandaFetch(`/packages?${params.toString()}`, {
		method: 'GET',
		signal,
	});

	const body: { packages: FeastPackageHeader[] } = await response.json();
	return body.packages;
}

export async function fetchPackage(
	id: string,
): Promise<FeastPackage | undefined> {
	try {
		const response = await pandaFetch(`/packages/${encodeURIComponent(id)}`, {
			method: 'GET',
		});

		if (response.status === 404) {
			return undefined;
		}

		return await response.json();
	} catch (error: unknown) {
		if (getHttpStatus(error) === 404) {
			return undefined;
		}

		throw error;
	}
}

export async function createPackage(
	request: CreatePackageRequest,
): Promise<void> {
	try {
		const response = await pandaFetch('/packages', {
			method: 'POST',
			headers: jsonHeaders,
			body: JSON.stringify(request),
		});

		if (response.status === 409) {
			throw response;
		}
	} catch (error: unknown) {
		if (getHttpStatus(error) === 409) {
			throw Object.assign(
				new Error('The package could not be created because of a conflict.'),
				{ status: 409 },
			);
		}

		throw error;
	}
}

export async function writePackage(
	id: string,
	request: WritePackageRequest,
): Promise<FeastPackage | undefined> {
	try {
		const response = await pandaFetch(`/packages/${encodeURIComponent(id)}`, {
			method: 'PUT',
			headers: jsonHeaders,
			body: JSON.stringify(request),
		});

		if (response.status === 404) {
			return undefined;
		}

		return await response.json();
	} catch (error: unknown) {
		if (getHttpStatus(error) === 404) {
			return undefined;
		}

		throw error;
	}
}

export async function updatePackageName(
	id: string,
	name: string,
): Promise<void> {
	try {
		await pandaFetch(`/packages/${encodeURIComponent(id)}/name`, {
			method: 'PATCH',
			headers: jsonHeaders,
			body: JSON.stringify({ name }),
		});
	} catch (error: unknown) {
		if (getHttpStatus(error) === 404) {
			throw Object.assign(new Error('The package could not be found.'), {
				status: 404,
			});
		}

		throw error;
	}
}

export async function updatePackageMetadata(
	id: string,
	metadata: FeastPackageMetadata,
): Promise<void> {
	try {
		await pandaFetch(`/packages/${encodeURIComponent(id)}/metadata`, {
			method: 'PUT',
			headers: jsonHeaders,
			body: JSON.stringify({
				...metadata,
				packageType: 'Feast',
			}),
		});
	} catch (error: unknown) {
		if (getHttpStatus(error) === 404) {
			throw Object.assign(new Error('The package could not be found.'), {
				status: 404,
			});
		}

		throw error;
	}
}

export async function updatePackageHiddenState(
	id: string,
	isHidden: boolean,
): Promise<void> {
	try {
		await pandaFetch(
			`/packages/${encodeURIComponent(id)}/is-hidden/${isHidden}`,
			{ method: 'PUT' },
		);
	} catch (error: unknown) {
		if (getHttpStatus(error) === 404) {
			throw Object.assign(new Error('The package could not be found.'), {
				status: 404,
			});
		}

		throw error;
	}
}

export function packageItemKey(
	item: Pick<PackageItem, 'cardType' | 'id'>,
): string {
	return `${item.cardType}:${item.id}`;
}

export async function fetchPackageItemDisplays(
	items: Array<Pick<PackageItem, 'id' | 'cardType'>>, //items: Array<Pick<PackageItem, "id" | "cardType">>,
): Promise<Record<string, PackageItemDisplay>> {
	const recipeIds = Array.from(
		new Set(
			items.filter((item) => item.cardType === 'recipe').map((item) => item.id),
		),
	);
	const chefIds = Array.from(
		new Set(
			items.filter((item) => item.cardType === 'chef').map((item) => item.id),
		),
	);

	const recipesPromise =
		recipeIds.length > 0
			? liveRecipes.recipesById(recipeIds)
			: Promise.resolve([]);

	const chefsPromise = Promise.all(
		Array.from({ length: Math.ceil(chefIds.length / 100) }, (_, index) =>
			liveCapi.chefs({
				ids: chefIds.slice(index * 100, (index + 1) * 100).join(','),
				'show-elements': 'image',
				'show-fields': 'all',
				'page-size': 100,
			}),
		),
	);

	const [recipes, chefPages] = await Promise.all([
		recipesPromise,
		chefsPromise,
	]);

	const displays: Record<string, PackageItemDisplay> = {};

	for (const recipe of recipes) {
		displays[packageItemKey({ cardType: 'recipe', id: recipe.id })] = {
			title: recipe.title,
			imageUrl: recipe.previewImage?.url || recipe.featuredImage?.url,
		};
	}

	for (const page of chefPages) {
		for (const chef of page.response.results) {
			displays[packageItemKey({ cardType: 'chef', id: chef.id })] = {
				title: chef.webTitle,
				imageUrl: chef.bylineImageUrl,
			};
		}
	}

	return displays;
}

export async function packageErrorMessage(error: unknown): Promise<string> {
	if (error instanceof Response) {
		const body = await error.text();

		if (body) {
			return `${error.status} ${error.statusText}: ${body}`;
		}
	}

	return attemptFriendlyErrorMessage(error);
}

export async function publishPackage(id: string): Promise<void> {
	await pandaFetch(`/packages/${encodeURIComponent(id)}/publish`, {
		method: 'POST',
	});
}
