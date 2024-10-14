import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import groupBy from 'lodash/groupBy';
import { priorities } from 'constants/priorities';
import { EditionPriority } from 'types/Priority';
import HomeContainer from './layout/HomeContainer';
import {
	selectAvailableEditions,
	selectEditionsPermission,
} from 'selectors/configSelectors';
import type { State } from 'types/State';

const renderPriority = (priority: string) => (
	<li key={priority}>
		<Link to={`/${priority}`}>{priority}</Link>
	</li>
);
const renderEditionPriority = (editionPriority: EditionPriority) => (
	<li key={editionPriority.title}>
		<Link to={`/manage-editions/${editionPriority.edition}`}>
			{editionPriority.title}
		</Link>
	</li>
);

type IProps = ReturnType<typeof mapStateToProps>;

const Home = ({ availableEditions, editEditionsIsPermitted }: IProps) => {
	const { editions, feast } = groupBy(availableEditions || [], 'platform');

	return (
		<HomeContainer>
			<h3>Front priorities</h3>
			<ul>{Object.keys(priorities).map(renderPriority)}</ul>
			<h3>Manage Editions app</h3>
			<ul>
				{!editEditionsIsPermitted
					? displayNoPermissionMessage('Editions')
					: editions
							.sort((a, b) =>
								a.editionType === b.editionType
									? a.title < b.title
										? 0
										: 1
									: 1,
							)
							.map(renderEditionPriority)}
			</ul>
			<h3>Manage edition list</h3>
			<ul>
				<li>
					<a href="/editions-api/editions">View Editions json metadata</a>
				</li>
				<li>
					<a href="/editions-api/republish-editions">Republish</a>
				</li>
			</ul>
			<h3>Manage Feast app</h3>
			<ul>{feast.map(renderEditionPriority)}</ul>
		</HomeContainer>
	);
};

const mapStateToProps = (state: State) => ({
	availableEditions: selectAvailableEditions(state),
	editEditionsIsPermitted: selectEditionsPermission(state)?.['edit-editions'],
});

const displayNoPermissionMessage = (onContent: string) => {
	return (
		<p>
			You do not have permission to edit {onContent}. Please contact{' '}
			<a href="mailto:central.production@guardian.co.uk">Central Production</a>{' '}
			to request access.
		</p>
	);
};

export default connect(mapStateToProps)(Home);
