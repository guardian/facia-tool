import { connect } from 'react-redux';
import { match, withRouter, RouteComponentProps } from 'react-router';
import { createSelectFrontIdWithOpenAndStarredStatesByPriority } from 'bundles/frontsUIBundle';
import { State } from '../types/State';
import FrontList from './FrontList';

type Props = {
  match: match<{ priority: string }>;
} & RouteComponentProps<any>;

const mapStateToProps = () => {
  const selectFrontIdWithOpenAndStarredStates = createSelectFrontIdWithOpenAndStarredStatesByPriority();
  return (state: State, props: Props) => {
    return {
      fronts: selectFrontIdWithOpenAndStarredStates(
        state,
        props.match.params.priority || ''
      )
    };
  };
};
export default withRouter(connect(mapStateToProps)(FrontList));
