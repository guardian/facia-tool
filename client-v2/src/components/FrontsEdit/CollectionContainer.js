// @flow

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import getFrontCollection from '../../actions/Collection';
import getArticlesForCollection from '../../actions/Articles';
import CollectionDetail from './CollectionDetail';

import type { ConfigCollectionDetailWithId } from '../../types/FrontsConfig';
import type { Collection } from '../../types/Collection';
import type { CapiArticle } from '../../types/Capi';
import type { State } from '../../types/State';

type Props = {
  collection: ConfigCollectionDetailWithId
};

type ConnectedComponentProps = Props & {
  frontsActions: Object,
  collections: {
    [string]: Collection
  },
  collectionArticles: {
    [string]: Array<CapiArticle>
  }
};

class CollectionContainer extends React.Component<ConnectedComponentProps> {
  componentDidMount() {
    const { props: { collection: { id } } } = this;
    const currentCollection = this.props.collections[id];
    if (!currentCollection) {
      this.props.frontsActions.getFrontCollection(id).then(() => {
        this.props.frontsActions.getArticlesForCollection(
          this.props.collections[id],
          id
        );
      });
    } else {
      this.props.frontsActions.getArticlesForCollection(currentCollection, id);
    }
  }

  render() {
    return (
      <CollectionDetail
        collectionConfig={this.props.collection}
        articles={this.props.collectionArticles[this.props.collection.id] || []}
      />
    );
  }
}

const mapStateToProps = (state: State) => ({
  collections: state.collections,
  collectionArticles: state.collectionArticles
});

const mapDispatchToProps = (dispatch: *) => ({
  frontsActions: bindActionCreators(
    {
      getFrontCollection,
      getArticlesForCollection
    },
    dispatch
  )
});

export default connect(mapStateToProps, mapDispatchToProps)(
  CollectionContainer
);
