import React from 'react';
import { EditionsIssue } from 'types/Edition';
import { styled } from 'constants/theme';
import moment from 'moment';

interface IssueProps {
  issue: EditionsIssue;
}

const IssueTable = styled.table`
  padding: 10px 0;
  td {
    padding: 0 5px 0;
  }
`;

const Issue = (props: IssueProps) => (
  <>
    <IssueTable>
      <tbody>
        <tr>
          <td>Issue name: </td>
          <td>{props.issue.name}</td>
        </tr>
        <tr>
          <td>Issue date:</td>
          <td>
            {moment(props.issue.publishDate, 'YYYY-MM-DD HH:mm:ss-ZZ').format(
              'Do MMMM YYYY'
            )}
          </td>
        </tr>
        <tr>
          <td>Published:</td>
          <td>{props.issue.lastPublished ? 'Yes' : 'No'}</td>
        </tr>
        <tr>
          <td>Last published:</td>
          <td>{props.issue.lastPublished}</td>
        </tr>
        <tr>
          <td>Creator:</td>
          <td>{props.issue.createdBy}</td>
        </tr>
        <tr>
          <td>Creator email:</td>
          <td>{props.issue.createdEmail}</td>
        </tr>
      </tbody>
    </IssueTable>
  </>
);

export default Issue;
