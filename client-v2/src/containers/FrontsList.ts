import { connect } from 'react-redux';
import { match, withRouter, RouteComponentProps } from 'react-router';

import { selectEditorFrontIds } from 'bundles/frontsUIBundle';
import { State } from '../types/State';
import FrontList from '../components/FrontList';
import { getFrontsWithPriority } from '../selectors/frontsSelectors';

type Props = {
  match: match<{ priority: string }>;
} & RouteComponentProps<any>;

const mapStateToProps = (state: State, props: Props) => {
  const openFrontIds = selectEditorFrontIds(state);
  return {
    fronts: getFrontsWithPriority(state, props.match.params.priority || '').map(
      ({ id }) => ({
        id,
        isOpen: openFrontIds.indexOf(id) !== -1
      })
    )
  };
};

export default withRouter(connect(mapStateToProps)(FrontList));
