import { EditionIssue } from 'types/Edition';
import { Moment } from 'moment';
import pandaFetch from './pandaFetch';

const dateFormat = 'YYYY-MM-DD';

export const fetchIssuesForDateRange = async (
  start: Moment,
  end: Moment
): Promise<EditionIssue[]> => {
  return pandaFetch(
    `http://localhost:3000/editions-api/issues?start=${start.format(
      dateFormat
    )}&end:${end.format(dateFormat)}`,
    {
      method: 'get',
      credentials: 'same-origin'
    }
  ).then(response => response.json());
};

export const fetchIssueByDate = async (
  date: Moment
): Promise<EditionIssue | void> => {
  return pandaFetch(
    `http://localhost:3000/editions-api/issues/${date.format(dateFormat)}`,
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
    .catch(() => {
      // We catch here to prevent 404s, which are expected, being uncaught.
      // Other errors are possible, of course, and it'd be nice to catch them here,
      // but without a general strategy for handling errors we drop them for now.
    });
};

export const createIssue = async (date: Moment): Promise<EditionIssue> => {
  return pandaFetch(`http://localhost:3000/editions-api/issues`, {
    method: 'post',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ date: `${date.format(dateFormat)}` })
  }).then(response => {
    return response.json();
  });
};
