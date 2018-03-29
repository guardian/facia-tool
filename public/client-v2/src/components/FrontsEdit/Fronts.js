// @flow

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { State } from '../../types/State';
import getFrontsConfig from '../../actions/FrontsConfig';

type Props = Object;

class Fronts extends React.Component<Props> {
  componentDidMount() {
    this.props.frontsActions.getFrontsConfig();
  }

  render() {
    return <div>list fronts</div>;
  }
}

const mapStateToProps = ({ frontsConfig }: State) => ({
  frontsConfig
});

const mapDispatchToProps = (dispatch: *) => ({
  frontsActions: bindActionCreators(
    {
      getFrontsConfig
    },
    dispatch
  )
});

export default connect(mapStateToProps, mapDispatchToProps)(Fronts);
