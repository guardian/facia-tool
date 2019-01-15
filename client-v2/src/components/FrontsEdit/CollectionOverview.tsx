import React from 'react';
import { Collection, CollectionItemSets } from 'shared/types/Collection';
import { State } from 'types/State';
import {
  createCollectionSelector,
  selectSharedState,
  createArticlesInCollectionSelector
} from 'shared/selectors/shared';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { createCollectionId } from 'shared/components/Collection';
import { Dispatch } from 'types/Store';
import { openCollectionsAndFetchTheirArticles } from 'actions/Collections';
import { events } from 'services/GA';

interface FrontCollectionOverviewContainerProps {
  frontId: string;
  collectionId: string;
  browsingStage: CollectionItemSets;
}

type FrontCollectionOverviewProps = FrontCollectionOverviewContainerProps & {
  collection: Collection | undefined;
  articleCount: number;
  openCollection: (id: string) => void;
};

const Container = styled.button`
  align-items: center;
  appearance: none;
  background-color: #f6f6f6;
  border: 1px solid #c4c4c4;
  border-radius: 1.25em;
  color: inherit;
  cursor: pointer;
  display: flex;
  font-family: TS3TextSans;
  font-size: 14px;
  height: 2.5em;
  margin-top: 0.75em;
  padding: 0.25em 0.75em;
  text-align: left;
  text-decoration: none;
  transition: background-color 0.3s;

  &:hover {
    background-color: #ddd;
  }

  &:focus {
    outline: none;
  }
`;

const TextLeft = styled.div`
  flex: 1 1;
  font-size: 14px;
  overflow: hidden;
  white-space: nowrap;
`;

const TextRight = styled.div`
  flex: 0 0 auto;
  font-size: 14px;
  overflow: hidden;
  white-space: nowrap;
`;

const Name = styled.span`
  color: #333;
  font-weight: 700;
`;

const CollectionOverview = ({
  collection,
  articleCount,
  openCollection,
  frontId
}: FrontCollectionOverviewProps) =>
  collection ? (
    <Container
      onClick={e => {
        e.preventDefault();
        events.overviewItemClicked(frontId)
        const el = document.getElementById(createCollectionId(collection));
        if (el) {
          el.scrollIntoView({
            behavior: 'smooth',
            inline: 'start',
            block: 'start'
          });
        }
        openCollection(collection.id);
      }}
    >
      <TextLeft>
        <Name>{collection.displayName}</Name> {articleCount} items
      </TextLeft>
      <TextRight>{/* more metadata */}</TextRight>
    </Container>
  ) : null;

const mapStateToProps = () => {
  const collectionSelector = createCollectionSelector();
  const articlesInCollectionSelector = createArticlesInCollectionSelector();
  return (state: State, props: FrontCollectionOverviewContainerProps) => ({
    collection: collectionSelector(selectSharedState(state), {
      collectionId: props.collectionId
    }),
    articleCount: articlesInCollectionSelector(selectSharedState(state), {
      collectionSet: props.browsingStage,
      collectionId: props.collectionId
    }).length
  });
};

const mapDispatchToProps = (
  dispatch: Dispatch,
  props: FrontCollectionOverviewContainerProps
) => ({
  openCollection: (id: string) =>
    dispatch(openCollectionsAndFetchTheirArticles([id], props.browsingStage))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CollectionOverview);
