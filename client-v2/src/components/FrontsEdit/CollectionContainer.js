// @flow

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import getFrontCollection from '../../actions/Collection';
import getArticlesForCollection from '../../actions/Articles';
import CollectionDetail from './CollectionDetail';
import Button from '../Button';
import Col from '../Col';
import Row from '../Row';
import { frontStages } from '../../constants/fronts';

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
  browsingStage: 'draft' | 'live'
};

class CollectionContainer extends React.Component<
  ConnectedComponentProps,
  ComponentState
> {
  state = {
    browsingStage: 'draft'
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

  handleStageSelect(key) {
    this.setState({
      browsingStage: frontStages[key]
    });
  }

  render() {
    const collectionArticles: CollectionArticles = this.props
      .collectionArticles[this.props.collection.id];
    const articlesWithState: Array<CapiArticle> = collectionArticles
      ? collectionArticles[this.state.browsingStage]
      : [];

    return (
      <div>
        <Row>
          {Object.keys(frontStages).map(key => (
            <Col key={key}>
              <Button
                selected={frontStages[key] === this.state.browsingStage}
                onClick={() => this.handleStageSelect(key)}
              >
                {frontStages[key]}
              </Button>
            </Col>
          ))}
        </Row>
        <CollectionDetail
          collectionConfig={this.props.collection}
          articles={articlesWithState}
        />
      </div>
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
