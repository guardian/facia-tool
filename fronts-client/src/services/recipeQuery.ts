import url from '../constants/url';
import { Recipe, RecipePartialIndexContent } from '../types/Recipe';
import Raven from 'raven-js';
import {
	FeastKeyword,
	FeastKeywordResponse,
	FeastKeywordType,
} from '../types/FeastKeyword';

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
	nameOrId: string;
	docCount: number;
}

export interface ChefSearchResponse {
	hits: number;
	results: ChefSearchHit[];
}

export interface RecipeSearchResponse {
	hits: number;
	maxScore: number;
	recipes: RecipeSearchHit[];
}

interface RecipeSearchTitlesResponse {
	score: number;
	href: string;
}

export type RecipeSearchHit = Recipe & {
	score: number;
};

export interface DietSearchResponse {
	'diet-ids': KeyAndCount[];
}

const widthParam = /width=(\d+)/;
export const updateImageScalingParams = (url: string) => {
	return url.replace(widthParam, 'width=83');
};

const setupRecipeThumbnails = (recep: Recipe) => {
	try {
		return {
			...recep,
			previewImage: recep.previewImage
				? {
						...recep.previewImage,
						url: updateImageScalingParams(recep.previewImage.url),
					}
				: undefined,
			featuredImage: recep.featuredImage
				? {
						...recep.featuredImage,
						url: updateImageScalingParams(recep.featuredImage.url),
					}
				: undefined,
		};
	} catch (err) {
		console.error(err);
		return recep;
	}
};

const recipeQuery = (baseUrl: string) => {
	const captureErrors = (status: number, content: string, url: string) => {
		const existingContext = Raven.getContext();
		Raven.setUserContext({ ...existingContext, recipeSearchResponse: content });
		Raven.captureMessage(`${url} returned ${status}`);
		Raven.setUserContext(existingContext);
		console.error(content);
	};

	const fetchOne = async (href: string): Promise<Recipe | undefined> => {
		const response = await fetch(`${baseUrl}${href}`);

		switch (response.status) {
			case 200:
				const content = await response.json();
				return setupRecipeThumbnails(content as unknown as Recipe);
			case 404:
			case 403:
				console.warn(
					`Search response returned outdated recipe ${baseUrl}${href}`,
				);
				return undefined;
			default:
				console.error(`Could not retrieve recipe ${href}: ${response.status}`);
				return undefined;
		}
	};

	const fetchAllRecipes = async (
		forRecipes: RecipeSearchTitlesResponse[],
	): Promise<RecipeSearchHit[]> => {
		const results = await Promise.all(
			forRecipes.map((r) =>
				fetchOne(r.href)
					.then((recep) =>
						recep
							? {
									...recep,
									score: r.score,
								}
							: undefined,
					)
					.catch(console.warn),
			),
		);

		return results.filter((r) => !!r) as RecipeSearchHit[];
	};

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
			const args = [
				params.query ? `q=${encodeURIComponent(params.query)}` : undefined,
				params.limit ? `limit=${encodeURIComponent(params.limit)}` : undefined,
			].filter((arg) => !!arg);

			const queryString = args.length > 0 ? '?' + args.join('&') : '';
			const url = `${baseUrl}/keywords/contributors${queryString}`;
			const response = await fetch(url);
			const content = await response.text();
			if (response.status == 200) {
				return JSON.parse(content) as ChefSearchResponse;
			} else {
				captureErrors(response.status, content, url);
				throw new Error(`Unable to contact recipe API: ${response.status}`);
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
			const queryDoc = JSON.stringify({
				...params,
				noStats: true, //we are not reading stats, so no point slowing the query down by retrieving them.
			});
			const response = await fetch(`${baseUrl}/search`, {
				method: 'POST',
				body: queryDoc,
				mode: 'cors',
				headers: new Headers({ 'Content-Type': 'application/json' }),
			});
			const content = await response.text();
			if (response.status == 200) {
				const searchResponse = JSON.parse(content);
				const recipes = await fetchAllRecipes(searchResponse.results);
				return {
					hits: searchResponse.hits,
					maxScore: searchResponse.maxScore,
					recipes,
				};
			} else {
				const prevContext = Raven.getContext();
				Raven.setUserContext({ ...prevContext, query: queryDoc });
				captureErrors(response.status, content, `${baseUrl}/search`);
				Raven.setUserContext(prevContext);
				throw new Error(`Unable to contact recipe API: ${response.status}`);
			}
		},
		recipesById: async (idList: string[]): Promise<Recipe[]> => {
			const doTheFetch = async (idsToFind: string[]) => {
				const indexResponse = await fetch(
					`/recipes/api/content/by-uid?ids=${idsToFind.join(',')}`,
					{
						credentials: 'include',
					},
				);
				if (indexResponse.status != 200) {
					const content = await indexResponse.text();
					captureErrors(
						indexResponse.status,
						content,
						`/recipes/api/content/by-uid?ids=${idsToFind.join(',')}`,
					);
					throw new Error(
						`Unable to retrieve partial index: server error ${indexResponse.status}`,
					);
				}

				const content =
					(await indexResponse.json()) as RecipePartialIndexContent;
				const recipeResponses = await Promise.all(
					content.results.map((entry) =>
						fetch(`${baseUrl}/content/${entry.checksum}`),
					),
				);
				const successes = recipeResponses.filter((_) => _.status === 200);
				return Promise.all(successes.map((_) => _.json())) as Promise<Recipe[]>;
			};

			const recurseTheList = async (
				idsToFind: string[],
				prevResults: Recipe[],
			): Promise<Recipe[]> => {
				const thisBatch = idsToFind.slice(0, 50); //we need to avoid a 414 URI Too Long error so batch into 50s
				const results = (await doTheFetch(thisBatch)).concat(prevResults);
				if (thisBatch.length == idsToFind.length) {
					//we finished the list
					return results;
				} else {
					return recurseTheList(idsToFind.slice(50), results);
				}
			};

			return recurseTheList(idList, []);
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
