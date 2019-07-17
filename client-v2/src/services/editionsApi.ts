import { EditionsIssue } from 'types/Edition';
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
      credentials: 'same-origin'
    }
  ).then(response => response.json());
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
      credentials: 'same-origin'
    }
  )
    .then(response => {
      if (response.status === 200) {
        return response.json();
      }
    })
    .then(issues => issues[0])
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
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ issueDate: `${date.format(dateFormat)}` })
  }).then(response => {
    return response.json();
  });
};

export const getIssue = async (id: string): Promise<EditionsIssue> => {
  return pandaFetch(`/editions-api/issues/${id}`, {
    method: 'get',
    credentials: 'same-origin'
  }).then(response => {
    return response.json();
  });
};
