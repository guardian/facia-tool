// @flow

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import getFrontCollection from 'Actions/Collection';
import getArticlesForCollection from 'Actions/Articles';
import { collectionSelector } from 'Selectors/collectionSelectors';
import { collectionArticlesSelector } from 'Selectors/collectionArticleSelectors';
import { getArticlesWithMeta } from 'Util/articleUtils';
import { getArticlesForStage } from 'Util/collectionUtils';
import type { ConfigCollectionDetailWithId } from 'Types/FrontsConfig';
import type { Collection } from 'Types/Collection';
import type { State } from 'Types/State';
import type { CapiArticle } from 'Types/Capi';
import CollectionDetail from './CollectionDetail';

type Props = {
  collectionConfig: ConfigCollectionDetailWithId,
  browsingStage: string // eslint-disable-line react/no-unused-prop-types
};

type ConnectedComponentProps = Props & {
  frontsActions: Object,
  collection: ?Collection,
  collectionArticles: Array<CapiArticle>
};

class CollectionContainer extends React.Component<ConnectedComponentProps> {
  componentDidMount() {
    const {
      props: {
        collectionConfig: { id },
        collection
      }
    } = this;
    if (!collection) {
      this.props.frontsActions.getFrontCollection(id).then(() => {
        this.props.frontsActions.getArticlesForCollection(
          this.props.collection,
          id
        );
      });
    } else {
      this.props.frontsActions.getArticlesForCollection(collection, id);
    }
  }

  render() {
    const {
      props: {
        collectionConfig: { groups },
        collection,
        browsingStage
      }
    } = this;
    const articlesConfig = getArticlesForStage(collection, browsingStage);

    const articlesWithMeta = getArticlesWithMeta(
      articlesConfig,
      this.props.collectionArticles
    );

    return (
      <CollectionDetail
        displayName={this.props.collectionConfig.displayName}
        articles={articlesWithMeta}
        groups={groups}
      />
    );
  }
}

const mapStateToProps = (state: State, props: Props) => ({
  collection: collectionSelector(state, props.collectionConfig.id),
  collectionArticles: collectionArticlesSelector(
    state,
    props.collectionConfig.id,
    props.browsingStage
  )
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
