import { qs } from 'util/qs';
import type { CapiArticle, CapiAtom, Tag } from 'types/Capi';
import { supportedAtomTypes } from 'types/Capi';
import pandaFetch from 'services/pandaFetch';
import url from 'constants/url';
import { attemptFriendlyErrorMessage } from 'util/error';

type Fetch = (path: string) => Promise<Response>;

type CAPIStatus = 'ok' | 'error';

function checkIsResults(
	response: CAPISearchQueryContentResponse | CAPISearchQueryResultsResponse,
): response is CAPISearchQueryResultsResponse {
	return !!(response as CAPISearchQueryResultsResponse).results;
}
interface CAPISearchQueryResultsResponse {
	results: CapiArticle[];
	section?: {
		webTitle: string;
	};
	tag?: Tag;
	currentPage: number;
	pageSize: number;
	pages: number;
	status: CAPIStatus;
	message?: string;
}

function checkIsContent(
	response: CAPISearchQueryContentResponse | CAPISearchQueryResultsResponse,
): response is CAPISearchQueryContentResponse {
	return !!(response as CAPISearchQueryContentResponse).content;
}
interface CAPISearchQueryContentResponse {
	content: CapiArticle;
	tag?: Tag;
	section?: {
		webTitle: string;
	};
	status: CAPIStatus;
	message?: string;
}

interface CAPISearchQueryResponse {
	response: CAPISearchQueryContentResponse | CAPISearchQueryResultsResponse;
}
interface CAPIOptions {
	// Does the query represent a single resource, e.g. an article or a
	// tag/section page? If so, we need to make a slightly different query.
	// We can't derive it from the query string becuase it has already been
	// trimmed of everything but its path and parameters.
	isResource: boolean;
}

interface CAPITagQueryReponse {
	response: {
		results: Tag[];
		status: CAPIStatus;
		message?: string;
		currentPage: number;
		pageSize: number;
		pages: number;
	};
}

interface CAPIInteractiveAtomResponse {
	response: {
		status: CAPIStatus;
		userTier: string;
		total: number;
		interactive: CAPIAtomInteractive;
	};
}

interface CAPIAtomInteractive {
	id: string;
	atomType: string;
	labels: [];
	defaultHtml: string;
	data: {
		interactive: {
			title: string;
		};
	};
	contentChangeDetails: object;
	commissioningDesks: [];
}

interface CAPIAtomsQueryResponse {
	response: {
		results: CapiAtom[];
		status: CAPIStatus;
		currentPage: number;
		pageSize: number;
		pages: number;
		message?: string;
	};
}

/**
 * Fetch a CAPI response.
 *
 * @throws If the response fails for any reason.
 */
const fetchCAPIResponse = async <
	TCAPIResponse extends
		| CAPISearchQueryResponse
		| CAPITagQueryReponse
		| CAPIAtomsQueryResponse,
>(
	request: string,
) => {
	let response: Response;
	try {
		response = await pandaFetch(request);
	} catch (e) {
		throw new Error(
			`Error making a request to CAPI, ${attemptFriendlyErrorMessage(e)}`,
		);
	}
	let result: TCAPIResponse;
	try {
		result = await response.json();
	} catch (e) {
		throw new Error(
			`Error parsing a response from CAPI: ${attemptFriendlyErrorMessage(e)}`,
		);
	}
	if (result.response.status === 'error') {
		throw new Error(`CAPI returned an error: ${result.response.message}`);
	}
	return result;
};

/**
 * Make various CAPI queries.
 *
 * @throws {Error} If fetch throws, CAPI returns an unparsable result, or CAPI returns an error.
 */
const capiQuery = (baseURL: string) => {
	const getCAPISearchString = (
		path: string,
		params: any,
		options?: CAPIOptions,
	) => {
		const { q, ...rest } = params;
		return options && options.isResource
			? `${baseURL}/${q}${qs({ ...rest })}`
			: `${baseURL}/${path}${qs({
					...params,
				})}`;
	};

	return {
		search: async (
			params: any,
			options?: CAPIOptions,
		): Promise<CAPISearchQueryResponse> => {
			return fetchCAPIResponse<CAPISearchQueryResponse>(
				getCAPISearchString(`search`, params, options),
			);
		},
		scheduled: async (
			params: any,
			options?: CAPIOptions,
		): Promise<CAPISearchQueryResponse> => {
			return fetchCAPIResponse<CAPISearchQueryResponse>(
				getCAPISearchString(`content/scheduled`, params, options),
			);
		},
		tags: async (params: any): Promise<CAPITagQueryReponse> => {
			return fetchCAPIResponse<CAPITagQueryReponse>(
				`${baseURL}/tags${qs({
					...params,
				})}`,
			);
		},
		sections: async (params: any): Promise<CAPITagQueryReponse> => {
			return fetchCAPIResponse<CAPITagQueryReponse>(
				`${baseURL}/sections${qs({
					...params,
				})}`,
			);
		},
		desks: async (params: any): Promise<CAPITagQueryReponse> => {
			return fetchCAPIResponse<CAPITagQueryReponse>(
				`${baseURL}/tags${qs({
					type: 'tracking',
					...params,
				})}`,
			);
		},
		chefs: async (params: any): Promise<CAPITagQueryReponse> => {
			return fetchCAPIResponse<CAPITagQueryReponse>(
				`${baseURL}/tags${qs({
					type: 'contributor',
					...params,
				})}`,
			);
		},
		atoms: async (params: { q?: string }): Promise<CAPIAtomsQueryResponse> => {
			// Search across every supported atom type. Most atom types expose their
			// title at the top level (`title`), but interactive atoms hold it under
			// `data.interactive.interactive_title`. We search both fields so the `q`
			// term matches interactive atoms as well as the other types.
			return fetchCAPIResponse<CAPIAtomsQueryResponse>(
				`${baseURL}/atoms${qs({
					types: supportedAtomTypes.join(','),
					searchFields: 'title,data.interactive.interactive_title',
					...params,
				})}`,
			);
		},
	};
};

export const liveCapi = capiQuery(url.capiLiveUrl);
export const previewCapi = capiQuery(url.capiPreviewUrl);

export {
	Fetch,
	CapiArticle,
	CAPISearchQueryResponse,
	CAPISearchQueryContentResponse,
	checkIsContent,
	CAPISearchQueryResultsResponse,
	checkIsResults,
	CAPITagQueryReponse,
	CAPIInteractiveAtomResponse,
	CAPIAtomInteractive,
	CAPIAtomsQueryResponse,
};

export default capiQuery;
