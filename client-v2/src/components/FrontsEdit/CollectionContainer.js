// @flow

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import getFrontCollection from '../../actions/Collection';
import getArticlesForCollection from '../../actions/Articles';
import CollectionDetail from './CollectionDetail';
import Button from '../Button';

import type { ConfigCollectionDetailWithId } from '../../types/FrontsConfig';
import type { Collection, CollectionArticles } from '../../types/Collection';
import type { State } from '../../types/State';
import type { CapiArticle } from '../../types/Capi';

type Props = {
  collection: ConfigCollectionDetailWithId
};

type ConnectedComponentProps = Props & {
  frontsActions: Object,
  collections: {
    [string]: Collection
  },
  collectionArticles: {
    [string]: {
      draft: CollectionArticles,
      live: CollectionArticles
    }
  }
};

type ComponentState = {
  browsingState: 'draft' | 'live'
};

class CollectionContainer extends React.Component<
  ConnectedComponentProps,
  ComponentState
> {
  state = {
    browsingState: 'draft'
  };

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
    const collectionArticles: CollectionArticles = this.props
      .collectionArticles[this.props.collection.id];
    const articlesWithState: Array<CapiArticle> = collectionArticles
      ? collectionArticles[this.state.browsingState]
      : [];

    return (
      <CollectionDetail
        collectionConfig={this.props.collection}
        articles={articlesWithState}
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
