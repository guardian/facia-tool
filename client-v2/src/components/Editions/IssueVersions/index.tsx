import React from 'react';
import { styled } from 'constants/theme';
import moment from 'moment';

import { IssueVersion } from 'types/Edition';
import VersionPublicationTable from './VersionPublicationTable';
import { getIssueVersions } from 'services/editionsApi';

const IssueVersionList = styled.ul`
  padding: 0;
  margin: 0;
  list-style: none;

  li {
    margin-bottom: 30px;
  }
`;

interface ComponentProps {
  issueId: string;
}

interface ComponentState {
  data: Array<IssueVersion>;
  polling: any;
}

class IssueVersions extends React.Component<ComponentProps, ComponentState> {
  constructor(props: ComponentProps) {
    super(props);

    this.state = {
      data: [],
      polling: setInterval(this.update, 500)
    };
  }

  componentWillUnmount() {
    clearInterval(this.state.polling);
  }

  private update = async () => {
    const { issueId } = this.props;

    const data = await getIssueVersions(issueId);

    this.setState({ data });
  };

  render() {
    const { data } = this.state;

    return (
      <>
        <p>Previously published versions of this issue:</p>
        <IssueVersionList>
          {data.map(issueVersion => (
            <li key={issueVersion.id}>
              <strong>
                {moment(issueVersion.launchedOn).format('YYYY-MM-DD HH:mm:ss')}
              </strong>
              &nbsp;launched by&nbsp;
              <span title={issueVersion.launchedEmail}>
                {issueVersion.launchedBy}
              </span>
              <VersionPublicationTable events={issueVersion.events} />
            </li>
          ))}
        </IssueVersionList>
      </>
    );
  }
}

export default IssueVersions;
