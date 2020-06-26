import type { EditionsIssue, IssueVersion } from 'types/Edition';
import type { CAPISearchQueryResponse } from './capiQuery';
import type { EditionsFrontMetadata } from 'types/FaciaApi';
import { Moment } from 'moment';
import pandaFetch from './pandaFetch';

const dateFormat = 'YYYY-MM-DD';

export const fetchIssuesForDateRange = async (
  editionName: string,
  start: Moment,
  end: Moment
): Promise<EditionsIssue[]> => {
  return pandaFetch(
    `/editions-api/editions/${editionName}/issues?dateFrom=${start.format(
      dateFormat
    )}&dateTo=${end.format(dateFormat)}`,
    {
      method: 'get',
      credentials: 'same-origin',
    }
  ).then((response) => response.json());
};

export const fetchIssueByDate = async (
  editionName: string,
  date: Moment
): Promise<EditionsIssue | void> => {
  return pandaFetch(
    `/editions-api/editions/${editionName}/issues?dateFrom=${date.format(
      dateFormat
    )}&dateTo=${date.format(dateFormat)}`,
    {
      method: 'get',
      credentials: 'same-origin',
    }
  )
    .then((response) => {
      if (response.status === 200) {
        return response.json();
      }
    })
    .then((issues) => issues[0])
    .catch(() => {
      // We catch here to prevent 404s, which are expected, being uncaught.
      // Other errors are possible, of course, and it'd be nice to catch them here,
      // but without a general strategy for handling errors we drop them for now.
    });
};

export const createIssue = async (
  editionName: string,
  date: Moment
): Promise<EditionsIssue> => {
  return pandaFetch(`/editions-api/editions/${editionName}/issues`, {
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

export const publishIssue = async (id: string): Promise<void> => {
  return pandaFetch(`/editions-api/issues/${id}/publish`, {
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
  id: string
): Promise<CAPISearchQueryResponse> => {
  return pandaFetch(`/editions-api/collections/${id}/prefill`, {
    method: 'get',
    credentials: 'same-origin',
  }).then((response) => response.json());
};

export const putFrontMetadata = (
  id: string,
  metadata: EditionsFrontMetadata
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

export async function getIssueVersions(
  issueId: string
): Promise<IssueVersion[]> {
  return await pandaFetch(`/editions-api/issues/${issueId}/versions`, {
    method: 'get',
  }).then((response) => response.json());
}

export async function getLastProofedIssueVersion(
  issueId: string
): Promise<IssueVersion[]> {
  return await pandaFetch(
    `/editions-api/issues/${issueId}/last-proofed-version`,
    {
      method: 'get',
    }
  ).then((response) => response.json());
}
