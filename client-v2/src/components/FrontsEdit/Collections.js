// @flow

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import getFrontCollection from '../../actions/Collection';
import CollectionDetail from './CollectionDetail';
import { getArticlesForCollection } from '../../util/collectionUtils';

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

type ComponentState = {
  collectionArticles: Array<Object>
};

class Collections extends React.Component<
  ConnectedComponentProps,
  ComponentState
> {
  state = {
    collectionArticles: []
  };

  componentDidMount() {
    if (!this.props.collections[this.props.collection.id]) {
      this.props.frontsActions
        .getFrontCollection(this.props.collection.id)
        .then(() =>
          getArticlesForCollection(
            this.props.collections[this.props.collection.id]
          ).then(articles => {
            this.setState({ collectionArticles: articles });
          })
        );
    }
  }

  render() {
    return (
      <CollectionDetail
        collectionConfig={this.props.collection}
        articles={this.state.collectionArticles}
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
