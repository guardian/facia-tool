import React from 'react';
import { State } from 'types/State';
import { Dispatch } from 'types/Store';
import { getFront } from 'selectors/frontsSelectors';
import { FrontConfig } from 'types/FaciaApi';
import CollectionOverview from './CollectionOverview';
import { connect } from 'react-redux';
import { CollectionItemSets } from 'shared/types/Collection';
import { styled } from 'constants/theme';
import ContainerHeadingPinline from 'shared/components/typography/ContainerHeadingPinline';
import ContentContainer from 'shared/components/layout/ContentContainer';
import { openCollectionsAndFetchTheirArticles } from 'actions/Collections';

interface FrontContainerProps {
  id: string;
  browsingStage: CollectionItemSets;
}

type FrontCollectionOverviewProps = FrontContainerProps & {
  front: FrontConfig;
  openAllCollections: (collections: string[]) => void;
};

const Container = styled(ContentContainer)`
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-left: 10px;
  width: 380px;
`;

const FrontCollectionsOverview = ({
  id,
  front,
  browsingStage,
  openAllCollections
}: FrontCollectionOverviewProps) => (
  <Container setBack>
    <ContainerHeadingPinline>
      Overview
      <button
        onClick={e => {
          e.preventDefault();
          openAllCollections(front.collections);
        }}
      >
        toggle
      </button>
    </ContainerHeadingPinline>
    {front.collections.map(collectionId => (
      <CollectionOverview
        frontId={id}
        key={collectionId}
        collectionId={collectionId}
        browsingStage={browsingStage}
      />
    ))}
  </Container>
);

const mapStateToProps = (state: State, props: FrontContainerProps) => ({
  front: getFront(state, props.id)
});

const mapDispatchToProps = (
  dispatch: Dispatch,
  props: FrontContainerProps
) => ({
  openAllCollections: (collections: string[]) =>
    dispatch(
      openCollectionsAndFetchTheirArticles(collections, props.browsingStage)
    )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FrontCollectionsOverview);
