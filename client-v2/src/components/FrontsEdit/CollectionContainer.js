// @flow

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import getFrontCollection from '../../actions/Collection';
import getArticlesForCollection from '../../actions/Articles';
import CollectionDetail from './CollectionDetail';
import { collectionSelector } from '../../selectors/collectionSelectors';
import { collectionArticlesSelector } from '../../selectors/collectionArticleSelectors';
import { getArticlesWithMeta } from '../../util/articleUtils';
import { getArticlesForStage } from '../../util/collectionUtils';
import type { ConfigCollectionDetailWithId } from '../../types/FrontsConfig';
import type { Collection } from '../../types/Collection';
import type { State } from '../../types/State';
import type { CapiArticle } from '../../types/Capi';

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
