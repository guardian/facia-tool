import { connect } from 'react-redux';
import { match, withRouter, RouteComponentProps } from 'react-router';
import { createSelectFrontIdWithOpenAndStarredStatesByPriority } from 'bundles/frontsUI';
import type { State } from 'types/State';
import FrontList from './FrontList';
import { selectEditMode } from 'selectors/pathSelectors';

type Props = {
	match: match<{ priority: string }>;
} & RouteComponentProps<any>;

const mapStateToProps = () => {
	const selectFrontIdWithOpenAndStarredStates =
		createSelectFrontIdWithOpenAndStarredStatesByPriority();
	return (state: State, props: Props) => {
		return {
			fronts: selectFrontIdWithOpenAndStarredStates(
				state,
				props.match.params.priority || '',
				selectEditMode(state) === 'editions' ? 'index' : 'id',
			),
		};
	};
};
export default withRouter(connect(mapStateToProps)(FrontList));
