import React from 'react';
import moment from 'moment';

import { styled } from 'constants/theme';
import { IssueVersionEvent } from 'types/Edition';

const PublicationHistoryTable = styled.table`
	width: 100%;
	border-collapse: collapse;
	border: 1px solid #eee;

	thead tr,
	tbody tr:nth-child(even) {
		background-color: #eee;
	}

	th,
	td {
		padding: 10px;
	}
`;

interface Props {
	events: IssueVersionEvent[];
}

export default (props: Props) => {
	return (
		<PublicationHistoryTable>
			<thead>
				<tr>
					<th style={{ width: '200px' }}>Time</th>
					<th style={{ width: '200px' }}>Status</th>
					<th>Message</th>
				</tr>
			</thead>
			<tbody>
				{props.events.map((event) => {
					return (
						<tr key={event.eventTime}>
							<td>{moment(event.eventTime).format('YYYY-MM-DD HH:mm:ss')}</td>
							<td>{event.status}</td>
							<td>{event.message}</td>
						</tr>
					);
				})}
			</tbody>
		</PublicationHistoryTable>
	);
};
