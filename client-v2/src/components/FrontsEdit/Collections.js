// @flow

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import getFrontCollection from '../../actions/Collection';
import CollectionDetail from './CollectionDetail';

import type { ConfigCollectionDetailWithId } from '../../types/Fronts';
import type { State } from '../../types/State';

type Props = {
  collection: ConfigCollectionDetailWithId
};

// TODO
type ConnectedComponentProps = Props & {
  frontsActions: Object,
  collections: Object
};

class Collections extends React.Component<ConnectedComponentProps> {
  componentDidMount() {
    if (!this.props.collections[this.props.collection.id]) {
      this.props.frontsActions.getFrontCollection(this.props.collection.id);
    }
  }

  render() {
    return (
      <CollectionDetail
        collectionConfig={this.props.collection}
        collection={this.props.collections[this.props.collection.id]}
      />
    );
  }
}

const mapStateToProps = (state: State) => ({
  collections: state.collections
});

const mapDispatchToProps = (dispatch: *) => ({
  frontsActions: bindActionCreators(
    {
      getFrontCollection
    },
    dispatch
  )
});

export default connect(mapStateToProps, mapDispatchToProps)(Collections);
