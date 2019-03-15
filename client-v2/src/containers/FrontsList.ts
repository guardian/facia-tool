import { connect } from 'react-redux';
import { match, withRouter, RouteComponentProps } from 'react-router';

import { selectEditorFrontIdsByPriority } from 'bundles/frontsUIBundle';
import { State } from '../types/State';
import FrontList from '../components/FrontList';
import { getFrontsWithPriority } from '../selectors/frontsSelectors';

type Props = {
  match: match<{ priority: string }>;
} & RouteComponentProps<any>;

const mapStateToProps = (state: State, props: Props) => {
  const priority = props.match.params.priority;
  const openFrontIds = selectEditorFrontIdsByPriority(state, priority);
  return {
    fronts: getFrontsWithPriority(state, priority || '').map(({ id }) => ({
      id,
      isOpen: openFrontIds.indexOf(id) !== -1
    }))
  };
};

export default withRouter(connect(mapStateToProps)(FrontList));
