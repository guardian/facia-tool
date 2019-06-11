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

export const fetchIssueByDate = async (date: Moment): Promise<EditionIssue> => {
  return pandaFetch(
    `http://localhost:3000/editions-api/issues/${date.format(dateFormat)}`,
    {
      method: 'get',
      credentials: 'same-origin'
    }
  )
    .then(response => {
      console.log('fetch issue by date', response);
      if (response) {
        return response.json();
      } else {
        return [];
      }
    })
    .catch(console.log('No issue was found for this date'));
};

export const createIssue = async (date: Moment): Promise<EditionIssue> => {
  return pandaFetch(`http://localhost:3000/editions-api/issues`, {
    method: 'post',
    // mode: 'no-cors',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ date: `${date.format(dateFormat)}` })
  }).then(response => {
    console.log(response);
    return response.json();
  });
};
