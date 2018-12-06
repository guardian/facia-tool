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

interface FrontCollectionOverviewContainerProps {
  collectionId: string;
  browsingStage: CollectionItemSets;
}

type FrontCollectionOverviewProps = FrontCollectionOverviewContainerProps & {
  collection: Collection | undefined;
  articleCount: number;
};

const Container = styled.a`
  align-items: center;
  background-color: #f6f6f6;
  border: 1px solid #c4c4c4;
  border-radius: 1.25em;
  color: inherit;
  display: flex;
  font-size: 14px;
  height: 2.5em;
  margin-top: 0.75em;
  padding: 0.25em 0.75em;
  text-decoration: none;
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
  articleCount
}: FrontCollectionOverviewProps) =>
  collection ? (
    <Container
      href={`#collection-${collection.id}`}
      onClick={e => {
        e.preventDefault();
        const el = document.getElementById(`collection-${collection.id}`);
        if (el) {
          el.scrollIntoView({
            inline: 'start',
            block: 'start'
          });
        }
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

export default connect(mapStateToProps)(CollectionOverview);
