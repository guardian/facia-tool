import url from '../constants/url';
import { RecipeNew, RecipeSearchHitNew } from '../types/Recipe';
import Raven from 'raven-js';
import {
	FeastKeyword,
	FeastKeywordResponse,
	FeastKeywordType,
} from '../types/FeastKeyword';
import { FeastGraphQL } from '@guardian/feast-multiplatform-backend-api';

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

export interface ChefSearchHit {
	contributorType: 'Profile' | 'Byline';
	displayName: string;
	profileId: string;
	bylineImageUrl?: string;
}

export interface ChefSearchResponse {
	hits: number;
	results: ChefSearchHit[];
}

export interface RecipeSearchResponse {
	hits: number;
	maxScore: number;
	recipes: RecipeSearchHitNew[];
}

export interface DietSearchResponse {
	'diet-ids': KeyAndCount[];
}

const widthParam = /width=(\d+)/;
export const updateImageScalingParams = (url: string) => {
	return url.replace(widthParam, 'width=83');
};
const normaliseByline = (str: string) => {
	return str.replace(/[^\\w]+/, '-');
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
		chefs: async (params: ChefSearchParams): Promise<ChefSearchResponse> => {
			const response = await gqlClient.faciaChefSearch(
				params.limit ?? 50,
				params.query,
			);

			if (response) {
				return {
					hits: response.length,
					results: response.map((chefOrByline) => {
						if ('contributorId' in chefOrByline) {
							return {
								contributorType: 'Profile',
								profileId: chefOrByline.contributorId,
								displayName: chefOrByline.webTitle,
								bylineImageUrl: chefOrByline.bylineImageUrl ?? undefined,
							};
						} else {
							return {
								contributorType: 'Byline',
								profileId: normaliseByline(chefOrByline.webTitle),
								displayName: chefOrByline.webTitle,
							};
						}
					}),
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
				params.queryText,
				params.filters?.celebrations ? params.filters.celebrations[0] : null,
				params.filters?.diets ? params.filters.diets[0] : null,
				params.uprateByDate,
			);

			if (response) {
				const recipes: RecipeSearchHitNew[] = response.results
					.map((r) =>
						r.recipe
							? {
									score: r.score ?? 0,
									id: r.recipe.id,
									title: r.recipe.title ?? '',
									byline: r.recipe.contributors.map((c) => c.webTitle),
									canonicalArticle: r.recipe.canonicalArticle ?? '',
									firstPublishedDate: r.recipe.firstPublishedDate ?? '',
									publishedDate: r.recipe.publishedDate ?? '',
									lastModifiedDate: r.recipe.lastModifiedDate ?? '',
									imageTemplateUrl:
										r.recipe.featuredImage?.templateUrl ?? undefined,
								}
							: null,
					)
					.filter((value) => !!value);
				console.log(recipes);
				return {
					hits: 0, //TBD
					maxScore: response.maxScore,
					recipes,
				};
			} else {
				throw new Error('No data was returned from search');
			}
		},
		recipesById: async (idList: string[]): Promise<RecipeNew[]> => {
			if (idList.length > 500) {
				throw new Error(
					'Too many requests in one go - this should be batched (FIXME!)',
				);
			}
			const response = await gqlClient.getRecipeBatch(idList);
			return response.map((result) => ({
				id: result.id,
				title: result.title ?? '',
				byline: result.contributors.map((c) => c.webTitle),
				firstPublishedDate: result.firstPublishedDate ?? '',
				lastModifiedDate: result.lastModifiedDate ?? '',
				publishedDate: result.publishedDate ?? '',
				canonicalArticle: result.canonicalArticle ?? '',
				imageTemplateUrl: result.featuredImage?.templateUrl ?? undefined,
			}));
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
