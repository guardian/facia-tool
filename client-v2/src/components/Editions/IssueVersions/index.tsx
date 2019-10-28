import React from 'react';
import { styled } from 'constants/theme';

import { IssueVersion, IssueVersionEvent } from 'types/Edition';
import VersionPublicationTable from './VersionPublicationTable';

function sortEvents(events: Array<IssueVersionEvent>) {
  return events.sort((a, b) => {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  });
}

function getData(issueId: string): Array<IssueVersion> {
  const data: Array<IssueVersion> = [
    {
      id: '2019-10-28T16:42:34.731Z',
      launchedOn: 1572280954731,
      launchedBy: 'Akash Askoolum',
      launchedEmail: 'akash.askoolum@guardian.co.uk',
      events: [
        {
          eventTime: 1572280954731,
          status: 'Started'
        }
      ]
    },
    {
      id: '2019-10-28T20:00:02.569Z',
      launchedOn: 1572292802569,
      launchedBy: 'Akash Askoolum',
      launchedEmail: 'akash.askoolum@guardian.co.uk',
      events: [
        {
          eventTime: 1572292802569,
          status: 'Started'
        }
      ]
    }
  ];

  return data.map(d => ({
    ...d,
    events: sortEvents(d.events)
  }));
}

const IssueVersionList = styled.ol`
  padding: 0;
  margin: 0;
`;

interface Props {
  issueId: string;
}

export default (props: Props) => {
  const data: Array<IssueVersion> = getData(props.issueId);

  return (
    <>
      <p>Previously published versions of this issue</p>
      <IssueVersionList>
        {data.map(issueVersion => (
          <li key={issueVersion.id}>
            {issueVersion.launchedOn}
            &nbsp;launched by&nbsp;
            <span title={issueVersion.launchedEmail}>
              {issueVersion.launchedBy}
            </span>
            <VersionPublicationTable events={issueVersion.events} />
          </li>
        ))}
      </ul>
    </>
  );
};
