import pandaFetch from './pandaFetch';
import { liveRecipes } from './recipeQuery';
import { liveCapi } from './capiQuery';
import { attemptFriendlyErrorMessage } from 'util/error';
import type {
	CreatePackageRequest,
	FeastPackage,
	FeastPackageMetadata,
	PackageItem,
	PackageItemDisplay,
	WritePackageRequest,
} from 'types/Packages';

const jsonHeaders = {
	'Content-Type': 'application/json',
};

export async function fetchPackages(
	title: string,
	signal?: AbortSignal,
): Promise<FeastPackage[]> {
	const params = new URLSearchParams({
		type: 'Feast',
		full: 'true',
		limit: '200',
		order: 'updated',
	});

	if (title.trim()) {
		params.set('title', title.trim());
	}

	const response = await pandaFetch(`/packages?${params.toString()}`, {
		method: 'GET',
		signal,
	});

	const body: { packages: FeastPackage[] } = await response.json();
	return body.packages;
}

export async function fetchPackage(id: string): Promise<FeastPackage> {
	const response = await pandaFetch(`/packages/${encodeURIComponent(id)}`, {
		method: 'GET',
	});

	return response.json();
}

export async function createPackage(
	request: CreatePackageRequest,
): Promise<void> {
	await pandaFetch('/packages', {
		method: 'POST',
		headers: jsonHeaders,
		body: JSON.stringify(request),
	});
}

export async function writePackage(
	id: string,
	request: WritePackageRequest,
): Promise<FeastPackage> {
	const response = await pandaFetch(`/packages/${encodeURIComponent(id)}`, {
		method: 'PUT',
		headers: jsonHeaders,
		body: JSON.stringify(request),
	});

	return response.json();
}

export async function updatePackageName(
	id: string,
	name: string,
): Promise<void> {
	await pandaFetch(`/packages/${encodeURIComponent(id)}/name`, {
		method: 'PATCH',
		headers: jsonHeaders,
		body: JSON.stringify({ name }),
	});
}

export async function updatePackageMetadata(
	id: string,
	metadata: FeastPackageMetadata,
): Promise<void> {
	await pandaFetch(`/packages/${encodeURIComponent(id)}/metadata`, {
		method: 'PUT',
		headers: jsonHeaders,
		body: JSON.stringify({
			...metadata,
			packageType: 'Feast',
		}),
	});
}

export async function updatePackageHiddenState(
	id: string,
	isHidden: boolean,
): Promise<void> {
	await pandaFetch(
		`/packages/${encodeURIComponent(id)}/is-hidden/${isHidden}`,
		{ method: 'PUT' },
	);
}

export function packageItemKey(
	item: Pick<PackageItem, 'cardType' | 'id'>,
): string {
	return `${item.cardType}:${item.id}`;
}

export async function fetchPackageItemDisplays(
	items: PackageItem[],
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
