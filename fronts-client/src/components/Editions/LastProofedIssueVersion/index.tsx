import React from 'react';
import { styled } from 'constants/theme';
import moment from 'moment';

import { IssueVersion } from 'types/Edition';
import VersionPublicationTable from './VersionPublicationTable';
import { getLastProofedIssueVersion } from 'services/editionsApi';

const IssueVersionList = styled.ul`
  max-height: 500px;
  overflow: scroll;
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
  data: IssueVersion[];
  polling: any;
}

class LastProofedIssueVersion extends React.Component<
  ComponentProps,
  ComponentState
> {
  constructor(props: ComponentProps) {
    super(props);

    this.state = {
      data: [],
      polling: setInterval(this.update, 500),
    };
  }

  public componentWillUnmount() {
    clearInterval(this.state.polling);
  }

  public render() {
    const { data } = this.state;

    if (data.length === 0) {
      return <p>This issue has not been published yet.</p>;
    }

    return (
      <IssueVersionList>
        <span>{data}</span>
      </IssueVersionList>
    );
  }

  private update = async () => {
    const { issueId } = this.props;

    const data = await getLastProofedIssueVersion(issueId);

    this.setState({ data });
  };
}

export default LastProofedIssueVersion;
