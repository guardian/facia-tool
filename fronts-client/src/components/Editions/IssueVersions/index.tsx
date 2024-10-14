import React from 'react';
import { styled } from 'constants/theme';
import moment from 'moment';

import { IssueVersion } from 'types/Edition';
import VersionPublicationTable from './VersionPublicationTable';
import { getIssueVersions } from 'services/editionsApi';
import { refreshEditionVersion as doRefreshEditionVersion } from 'bundles/editionsIssueBundle';
import { Dispatch, bindActionCreators } from 'redux';
import { connect } from 'react-redux';

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

// Props we expect from JSX <component issueId="" />
interface ContainerProps {
	issueId: string;
}

// Props we expect from redux bindings
type ComponentProps = ContainerProps & ReturnType<typeof mapDispatchToProps>;

interface ComponentState {
	data: IssueVersion[];
	polling: any;
}

class IssueVersions extends React.Component<ComponentProps, ComponentState> {
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
				{data.map((issueVersion) => (
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
		);
	}

	private update = async () => {
		const { issueId, refreshEditionVersion } = this.props;
		const data = await getIssueVersions(issueId);
		this.setState({ data });
		refreshEditionVersion(issueId);
	};
}

// Bind refreshEditionVersion to store.dispatch
// and pass it into the component

const mapDispatchToProps = (dispatch: Dispatch) =>
	bindActionCreators(
		{
			refreshEditionVersion: doRefreshEditionVersion,
		},
		dispatch,
	);

export default connect(undefined, mapDispatchToProps)(IssueVersions);
