import React from 'react';
import { connect } from 'react-redux';
import { styled } from 'constants/theme';
import { State } from 'types/State';
import { getFront } from 'selectors/frontsSelectors';
import { FrontConfig } from 'types/FaciaApi';
import CollectionOverview from './CollectionOverview';
import { CollectionItemSets } from 'shared/types/Collection';
import ContainerHeadingPinline from 'shared/components/typography/ContainerHeadingPinline';
import ContentContainer from 'shared/components/layout/ContentContainer';

interface FrontContainerProps {
  id: string;
  browsingStage: CollectionItemSets;
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
  overflow: hidden;
  ${({ isClosed }) => (isClosed ? 'padding: 0; height: 100%' : '')}
`;

const ContainerBody = styled.div`
  width: 130px;
`;

const FrontCollectionsOverview = ({
  id,
  front,
  browsingStage
}: FrontCollectionOverviewProps) => (
  <Container setBack isClosed={false}>
    <ContainerHeadingPinline>'Overview'</ContainerHeadingPinline>
    <ContainerBody>
      {front.collections.map(collectionId => (
        <CollectionOverview
          frontId={id}
          key={collectionId}
          collectionId={collectionId}
          browsingStage={browsingStage}
        />
      ))}
    </ContainerBody>
  </Container>
);

const mapStateToProps = (state: State, props: FrontContainerProps) => ({
  front: getFront(state, { frontId: props.id })
});

export default connect(mapStateToProps)(FrontCollectionsOverview);
