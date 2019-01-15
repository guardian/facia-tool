import React from 'react';
import { State } from 'types/State';
import { getFront } from 'selectors/frontsSelectors';
import { FrontConfig } from 'types/FaciaApi';
import CollectionOverview from './CollectionOverview';
import { connect } from 'react-redux';
import { CollectionItemSets } from 'shared/types/Collection';
import styled from 'styled-components';
import ContainerHeadingPinline from 'shared/components/typography/ContainerHeadingPinline';
import ContentContainer from 'shared/components/layout/ContentContainer';

interface FrontContainerProps {
  id: string;
  browsingStage: CollectionItemSets;
}

type FrontCollectionOverviewProps = FrontContainerProps & {
  front: FrontConfig;
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
  browsingStage
}: FrontCollectionOverviewProps) => (
  <Container setBack>
    <ContainerHeadingPinline>Overview</ContainerHeadingPinline>
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

export default connect(mapStateToProps)(FrontCollectionsOverview);
