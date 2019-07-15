import React from 'react';
import { connect } from 'react-redux';
import { styled } from 'constants/theme';
import { State } from 'types/State';
import { selectFront } from 'selectors/frontsSelectors';
import { FrontConfig } from 'types/FaciaApi';
import CollectionOverview from './CollectionOverview';
import { CollectionItemSets } from 'shared/types/Collection';
import ContainerHeadingPinline from 'shared/components/typography/ContainerHeadingPinline';
import ContentContainer from 'shared/components/layout/ContentContainer';

interface FrontContainerProps {
  id: string;
  browsingStage: CollectionItemSets;
  currentCollection: string | undefined;
}

type FrontCollectionOverviewProps = FrontContainerProps & {
  front: FrontConfig;
};

interface ContainerProps {
  isClosed: boolean;
}

const Container = styled(ContentContainer)<ContainerProps>`
  border: ${({ isClosed, theme }) =>
    isClosed ? `1px solid ${theme.shared.base.colors.borderColor}` : 'none'};
  border-top: none;
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-left: 10px;
  margin-top: 43px;
  max-height: calc(100% - 43px);
  overflow-y: scroll;
  padding: 0;
  ${({ isClosed }) => (isClosed ? 'padding: 0; height: 100%' : '')}
`;

export const overviewMinWidth = 160;

const ContainerBody = styled.div`
  width: ${overviewMinWidth}px;
  overflow-y: scroll;
`;

const FrontCollectionsOverview = ({
  id,
  front,
  browsingStage,
  currentCollection
}: FrontCollectionOverviewProps) => (
  <Container setBack isClosed={false}>
    <ContainerHeadingPinline>Overview</ContainerHeadingPinline>
    <ContainerBody>
      {front.collections.map(collectionId => (
        <CollectionOverview
          frontId={id}
          key={collectionId}
          collectionId={collectionId}
          isSelected={currentCollection === collectionId}
          browsingStage={browsingStage}
        />
      ))}
    </ContainerBody>
  </Container>
);

const mapStateToProps = (state: State, props: FrontContainerProps) => ({
  front: selectFront(state, { frontId: props.id })
});

export default connect(mapStateToProps)(FrontCollectionsOverview);
