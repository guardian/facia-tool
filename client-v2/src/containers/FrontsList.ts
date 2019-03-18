import { connect } from 'react-redux';
import { match, withRouter, RouteComponentProps } from 'react-router';

import { createSelectFrontIdAndOpenStateByPriority } from 'bundles/frontsUIBundle';
import { State } from '../types/State';
import FrontList from '../components/FrontList';

type Props = {
  match: match<{ priority: string }>;
} & RouteComponentProps<any>;

const mapStateToProps = () => {
  const selectFrontIdAndOpenState = createSelectFrontIdAndOpenStateByPriority();
  return (state: State, props: Props) => {
    return {
      fronts: selectFrontIdAndOpenState(
        state,
        props.match.params.priority || ''
      )
    };
  };
};
export default withRouter(connect(mapStateToProps)(FrontList));
