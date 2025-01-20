import type { EditionsIssue, IssueVersion } from 'types/Edition';
import type { CAPISearchQueryResponse } from './capiQuery';
import type { EditionsFrontMetadata } from 'types/FaciaApi';
import { Moment } from 'moment';
import pandaFetch from './pandaFetch';
import type { EditionCollectionResponse } from 'types/FaciaApi';
import type { EditionsCollection } from 'types/Edition';
import { attemptFriendlyErrorMessage } from 'util/error';

const dateFormat = 'YYYY-MM-DD';

export const fetchIssuesForDateRange = async (
	editionName: string,
	start: Moment,
	end: Moment,
): Promise<{ issues: EditionsIssue[]; platform: string }> => {
	return pandaFetch(
		`/editions-api/editions/${editionName}/issues?dateFrom=${start.format(
			dateFormat,
		)}&dateTo=${end.format(dateFormat)}`,
		{
			method: 'get',
			credentials: 'same-origin',
		},
	).then((response) => response.json());
};

export const fetchIssueByDate = async (
	editionName: string,
	date: Moment,
): Promise<EditionsIssue | void> => {
	return fetchIssuesForDateRange(editionName, date, date)
		.then(({ issues }) => issues[0])
		.catch(() => {
			// We catch here to prevent 404s, which are expected, being uncaught.
			// Other errors are possible, of course, and it'd be nice to catch them here,
			// but without a general strategy for handling errors we drop them for now.
		});
};

export const createIssue = async (
	editionName: string,
	date: Moment,
	fromPreviousIssue?: boolean,
): Promise<EditionsIssue> => {
	const path = fromPreviousIssue
		? `/editions-api/editions/${editionName}/issues/from-previous-issue`
		: `/editions-api/editions/${editionName}/issues`;
	return pandaFetch(path, {
		method: 'post',
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include',
		body: JSON.stringify({ issueDate: `${date.format(dateFormat)}` }),
	}).then((response) => {
		return response.json();
	});
};

export const getIssueSummary = async (id: string): Promise<EditionsIssue> => {
	return pandaFetch(`/editions-api/issues/${id}/summary`, {
		method: 'get',
		credentials: 'same-origin',
	}).then((response) => {
		return response.json();
	});
};

export const proofIssue = async (id: string): Promise<void> => {
	return pandaFetch(`/editions-api/issues/${id}/proof`, {
		method: 'POST',
	}).then(() => {});
};

export const publishIssue = async (
	id: string,
	version: string,
): Promise<void> => {
	return pandaFetch(`/editions-api/issues/${id}/publish/${version}`, {
		method: 'POST',
	}).then(() => {});
};

export const checkIssue = async (id: string): Promise<string[]> => {
	return pandaFetch(`/editions-api/issues/${id}/preflight-checks`, {
		method: 'GET',
	}).then((response) => {
		return response.json();
	});
};

export const getPrefills = async (
	id: string,
): Promise<CAPISearchQueryResponse> => {
	return pandaFetch(`/editions-api/collections/${id}/prefill`, {
		method: 'get',
		credentials: 'same-origin',
	}).then((response) => response.json());
};

export const putFrontMetadata = (
	id: string,
	metadata: EditionsFrontMetadata,
) => {
	return pandaFetch(`/editions-api/fronts/${id}/metadata`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(metadata),
	}).then((response) => response.json());
};

export const putFrontHiddenState = (id: string, hidden: boolean) => {
	return pandaFetch(`/editions-api/fronts/${id}/is-hidden/${hidden}`, {
		method: 'PUT',
	}).then((response) => response.json());
};

export const addCollectionToFront = (
	frontId: string,
): Promise<EditionsCollection[]> => {
	return pandaFetch(`/editions-api/fronts/${frontId}/collection`, {
		method: 'PUT',
	}).then((response) => response.json());
};

export const removeCollectionFromFront = (
	frontId: string,
	collectionId: string,
): Promise<EditionsCollection[]> => {
	return pandaFetch(
		`/editions-api/fronts/${frontId}/collection/${collectionId}`,
		{
			method: 'DELETE',
		},
	).then((response) => response.json());
};

export const moveCollection = (
	frontId: string,
	collectionId: string,
	index: number,
): Promise<EditionsCollection[]> => {
	return pandaFetch(
		`/editions-api/fronts/${frontId}/collection/${collectionId}/move`,
		{
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ newIndex: index }),
		},
	).then((response) => response.json());
};

export async function getIssueVersions(
	issueId: string,
): Promise<IssueVersion[]> {
	return await pandaFetch(`/editions-api/issues/${issueId}/versions`, {
		method: 'get',
	}).then((response) => response.json());
}

export async function getLastProofedIssueVersion(
	issueId: string,
): Promise<string> {
	return await pandaFetch(
		`/editions-api/issues/${issueId}/last-proofed-version`,
		{
			method: 'get',
		},
	).then((response) => response.json());
}

export async function deleteIssue(issueId: string): Promise<string> {
	return await pandaFetch(`/editions-api/issues/${issueId}`, {
		credentials: 'include',
		method: 'DELETE',
	})
		.then(() => 'Deleted')
		.catch(() => 'Failed');
}

export const getEditionsCollections = async (
	// fetchCollections
	collections: Array<{ id: string; lastUpdated?: number }>,
): Promise<EditionCollectionResponse[]> => {
	const response = await pandaFetch('/editions-api/collections', {
		body: JSON.stringify(collections),
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'same-origin',
	});
	return response.json();
};

export const updateEditionsCollection =
	(id: string) =>
	async (collection: EditionsCollection): Promise<void> => {
		try {
			const response = await pandaFetch(`/editions-api/collections/${id}`, {
				method: 'put',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'same-origin',
				body: JSON.stringify({ id, collection }),
			});
			return await response.json();
		} catch (e) {
			throw new Error(
				`Tried to update collection with id ${id}, but the server responded with ${attemptFriendlyErrorMessage(
					e,
				)}`,
			);
		}
	};

export const renameEditionsCollection =
	(id: string) =>
	async (collection: EditionsCollection): Promise<void> => {
		try {
			const response = await pandaFetch(
				`/editions-api/collections/${id}/name`,
				{
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'same-origin',
					body: JSON.stringify({ id, collection }),
				},
			);
			return await response.json();
		} catch (e) {
			throw new Error(
				`Tried to update collection with id ${id}, but the server responded with ${attemptFriendlyErrorMessage(
					e,
				)}`,
			);
		}
	};

export const markCollectionForUSOnly =
	(id: string) =>
	async (collection: EditionsCollection): Promise<void> => {
		try {
			const response = await pandaFetch(
				`editions-api/collections/${id}/targeted_regions`,
				{
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'same-origin',
					body: JSON.stringify({ id, collection }),
				},
			);
			return await response.json();
		} catch (e) {
			throw new Error(
				`Tried to update collection with id ${id}, but server responded with error: ${attemptFriendlyErrorMessage(e)}`,
			);
		}
	};
