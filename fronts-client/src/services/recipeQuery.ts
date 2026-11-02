import { Chef, ChefSearchResponse } from '../types/Chef';
import { Recipe, RecipeSearchHit, RecipeSearchResponse } from '../types/Recipe';
import Raven from 'raven-js';
import {
	FeastKeyword,
	FeastKeywordResponse,
	FeastKeywordType,
} from '../types/FeastKeyword';
import { FeastGraphQL } from '@guardian/feast-multiplatform-backend-api';
import url from '../constants/url';

interface KeyAndCount {
	key: string;
	doc_count: number;
}

export interface ChefSearchParams {
	query?: string;
	limit?: number;
}

export interface RecipeSearchFilters {
	diets?: string[];
	contributors?: string[];
	cuisines?: string[];
	mealTypes?: string[];
	celebrations?: string[];
	filterType: 'During' | 'Post';
}

export type DateParamField =
	| undefined
	| 'publishedDate'
	| 'firstPublishedDate'
	| 'lastModifiedDate';

export interface RecipeSearchParams {
	queryText: string;
	searchType?: 'Embedded' | 'Match' | 'Lucene';
	fields?: string[];
	kfactor?: number;
	limit?: number;
	filters?: RecipeSearchFilters;
	uprateByDate?: DateParamField;
	uprateConfig?: {
		originDate?: string; //should be ISO format date, defaults to today
		//take this and add it to `offsetDays`. Then, weights will be modified so that
		//at originDate +/- this many days results will be downweighted by `decay`
		dropoffScaleDays?: number;
		offsetDays?: number;
		decay?: number;
	};
	format?: 'Full' | 'Titles';
	allSponsors?: boolean;
}

export interface DietSearchResponse {
	'diet-ids': KeyAndCount[];
}

const widthParam = /width=(\d+)/;
export const updateImageScalingParams = (url: string) => {
	return url.replace(widthParam, 'width=83');
};
export const normaliseByline = (str: string) => {
	return 'byline/' + str.replace(/\W+/, '-').toLowerCase();
};

const toChef = (chefOrByline: {
	contributorId?: string;
	webTitle: string;
	bylineImageUrl?: string | null;
	bio?: string | null;
	webUrl?: string;
}): Chef => {
	if ('contributorId' in chefOrByline && chefOrByline.contributorId) {
		return {
			type: 'Profile',
			id: chefOrByline.contributorId,
			webTitle: chefOrByline.webTitle,
			bylineImageUrl: chefOrByline.bylineImageUrl ?? undefined,
			bio: chefOrByline.bio ?? undefined,
			webUrl: new URL(chefOrByline.contributorId, url.liveUrlPROD).toString(),
		};
	} else {
		return {
			type: 'Byline',
			id: normaliseByline(chefOrByline.webTitle),
			webTitle: chefOrByline.webTitle,
		};
	}
};

const toRecipeSearchHit = (recipe: {
	id: string;
	title?: string | null;
	contributors: Array<{ webTitle: string }>;
	canonicalArticle?: string | null;
	firstPublishedDate?: string | null;
	publishedDate?: string | null;
	lastModifiedDate?: string | null;
	featuredImage?: {
		templateUrl?: string | null;
	} | null;
	score?: number | null;
}): RecipeSearchHit | null => {
	if (!recipe || !recipe.id) {
		return null;
	}

	return {
		score: recipe.score ?? 0,
		id: recipe.id,
		title: recipe.title ?? '',
		byline: recipe.contributors.map((c) => c.webTitle),
		canonicalArticle: recipe.canonicalArticle ?? '',
		firstPublishedDate: recipe.firstPublishedDate ?? '',
		publishedDate: recipe.publishedDate ?? '',
		lastModifiedDate: recipe.lastModifiedDate ?? '',
		imageTemplateUrl: recipe.featuredImage?.templateUrl ?? undefined,
	};
};

const recipeQuery = (baseUrl: string) => {
	const captureErrors = (status: number, content: string, url: string) => {
		const existingContext = Raven.getContext();
		Raven.setUserContext({ ...existingContext, recipeSearchResponse: content });
		Raven.captureMessage(`${url} returned ${status}`);
		Raven.setUserContext(existingContext);
		console.error(content);
	};

	const gqlClient = new FeastGraphQL(baseUrl);

	const baseUrlForKwType = (kwType: FeastKeywordType) => {
		switch (kwType) {
			case 'celebration':
				return `${baseUrl}/keywords/celebrations`;
			case 'mealType':
				return `${baseUrl}/keywords/meal-types`;
			case 'cuisine':
				return `${baseUrl}/keywords/cuisines`;
			case 'diet':
				return `${baseUrl}/keywords/diet-ids`;
		}
	};

	return {
		chefs: async (
			params: ChefSearchParams,
			ids?: string[],
		): Promise<ChefSearchResponse> => {
			const response = await gqlClient.faciaChefSearch(
				params.limit ?? 50,
				params.query,
				ids ?? null,
			);

			if (response) {
				return {
					hits: response.length,
					results: response.map((chefOrByline) => toChef(chefOrByline)),
				};
			} else {
				throw new Error('No data was returned from search');
			}
		},
		diets: async (): Promise<DietSearchResponse> => {
			const response = await fetch(`${baseUrl}/keywords/diet-ids`);
			const content = await response.text();
			if (response.status == 200) {
				return JSON.parse(content) as DietSearchResponse;
			} else {
				captureErrors(response.status, content, `${baseUrl}/keywords/diet-ids`);
				throw new Error(`Unable to contact recipe API: ${response.status}`);
			}
		},
		recipes: async (
			params: RecipeSearchParams,
		): Promise<RecipeSearchResponse> => {
			const response = await gqlClient.faciaRecipeSearch(
				params.queryText ?? '',
				params.filters?.celebrations ? params.filters.celebrations[0] : null,
				params.filters?.diets ? params.filters.diets[0] : null,
				params.uprateByDate,
			);

			if (response) {
				const recipes = response.results
					.map((r) =>
						toRecipeSearchHit({
							...r.recipe,
							score: r.score ?? 0,
						}),
					)
					.filter((value): value is RecipeSearchHit => !!value);
				return {
					hits: recipes.length,
					maxScore: response.maxScore ?? 0,
					recipes,
				};
			} else {
				throw new Error('No data was returned from search');
			}
		},
		recipesById: async (idList: string[]): Promise<Recipe[]> => {
			const getNextPage = async (
				head: string[],
				tail: string[],
				prevResults: Recipe[],
			) => {
				const response = await gqlClient.getRecipeBatch(head);
				const results = [
					...prevResults,
					...response.map((result) => ({
						id: result.id,
						title: result.title ?? '',
						byline: result.contributors.map((c) => c.webTitle),
						firstPublishedDate: result.firstPublishedDate ?? '',
						lastModifiedDate: result.lastModifiedDate ?? '',
						publishedDate: result.publishedDate ?? '',
						canonicalArticle: result.canonicalArticle ?? '',
						imageTemplateUrl: result.featuredImage?.templateUrl ?? undefined,
					})),
				];
				if (tail.length > 0) {
					return getNextPage(tail.slice(0, 500), tail.slice(500), results);
				} else {
					return results;
				}
			};

			if (idList.length > 500) {
				return getNextPage(idList.slice(0, 500), idList.slice(500), []);
			} else {
				return getNextPage(idList, [], []);
			}
		},
		keywords: async (kwType: FeastKeywordType): Promise<FeastKeyword[]> => {
			const url = baseUrlForKwType(kwType);
			const response = await fetch(url);
			if (response.status === 200) {
				const data = (await response.json()) as FeastKeywordResponse;

				const vals = Object.values(data);

				if (vals.length < 1) {
					console.error(
						`Recipe API response was invalid, no data for ${kwType} keyword`,
					);
					throw new Error('Invalid API response');
				}

				return vals[0].map((kw) => ({
					keywordType: kwType,
					id: kw.key,
					doc_count: kw.doc_count,
				}));
			} else {
				const bodyContent = await response.text();
				console.error(
					`Unable to communicate with recipe search: ${response.status} ${bodyContent}`,
				);
				throw new Error(`Recipe API responded with ${response.status}`);
			}
		},
	};
};

const isCode = () =>
	window.location.hostname.includes('code.') ||
	window.location.hostname.includes('local.');
export const liveRecipes = recipeQuery(
	isCode() ? url.codeRecipes : url.recipes,
);
