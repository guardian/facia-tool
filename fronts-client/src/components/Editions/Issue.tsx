import React from 'react';
import { EditionsIssue } from 'types/Edition';
import { styled } from 'constants/theme';
import moment from 'moment';

interface IssueProps {
	issue: EditionsIssue;
}

const IssueTable = styled.table`
	border: 1px solid #eee;
	border-collapse: collapse;
	tr:nth-child(even) {
		background-color: #eee;
	}
	td {
		padding: 10px;
	}
`;

const Issue = (props: IssueProps) => {
	const issueDateText = moment(props.issue.issueDate).format('Do MMMM YYYY');
	const lastPublishedText = props.issue.launchedOn
		? moment(props.issue.issueDate).format('Do MMMM YYYY')
		: 'N/A';
	return (
		<>
			<IssueTable>
				<tbody>
					<tr>
						<td>Issue name: </td>
						<td>{props.issue.edition}</td>
					</tr>
					<tr>
						<td>Issue date:</td>
						<td>{issueDateText}</td>
					</tr>
					<tr>
						<td>Published:</td>
						<td>{props.issue.launchedOn ? 'Yes' : 'No'}</td>
					</tr>
					<tr>
						<td>Last published:</td>
						<td>{lastPublishedText}</td>
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
};

export default Issue;
