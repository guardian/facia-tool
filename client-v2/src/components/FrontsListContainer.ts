import { connect } from 'react-redux';
import { match, withRouter, RouteComponentProps } from 'react-router';
import { createSelectFrontIdWithOpenAndStarredStatesByPriority } from 'bundles/frontsUIBundle';
import { State } from '../types/State';
import FrontList from './FrontList';
import { selectIsEditingEditions } from 'selectors/pathSelectors';

type Props = {
  match: match<{ priority: string }>;
} & RouteComponentProps<any>;

const mapStateToProps = () => {
  const selectFrontIdWithOpenAndStarredStates = createSelectFrontIdWithOpenAndStarredStatesByPriority();
  return (state: State, props: Props) => {
    return {
      fronts: selectFrontIdWithOpenAndStarredStates(
        state,
        props.match.params.priority || '',
        selectIsEditingEditions(state) ? 'index' : 'id'
      )
    };
  };
};
export default withRouter(connect(mapStateToProps)(FrontList));
