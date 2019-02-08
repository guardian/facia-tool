import React from 'react';
import { State } from 'types/State';
import { Dispatch } from 'types/Store';
import { getFront } from 'selectors/frontsSelectors';
import { FrontConfig } from 'types/FaciaApi';
import CollectionOverview from './CollectionOverview';
import { connect } from 'react-redux';
import { CollectionItemSets } from 'shared/types/Collection';
import { styled } from 'constants/theme';
import ButtonCircularCaret, {
  ButtonCircularWithTransition
} from 'shared/components/input/ButtonCircularCaret';
import ContainerHeadingPinline from 'shared/components/typography/ContainerHeadingPinline';
import ContentContainer from 'shared/components/layout/ContentContainer';
import { closeCollections } from 'actions/Collections';

interface FrontContainerProps {
  id: string;
  browsingStage: CollectionItemSets;
}

type FrontCollectionOverviewProps = FrontContainerProps & {
  front: FrontConfig;
  closeAllCollections: (collections: string[]) => void;
};
interface CollectionOverviewCollapseAllButtonProps {
  front: FrontConfig;
  closeAllCollections: (collections: string[]) => void;
}

const Container = styled(ContentContainer)`
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-left: 10px;
  width: 380px;
`;

const CollapseAllButtonContainer = styled('div')`
  margin-top: 10px;
  width: 100%;
  display: flex;
  justify-content: flex-end;
  :hover {
    ${ButtonCircularWithTransition} {
      background-color: ${({ theme }) =>
        theme.shared.button.backgroundColorFocused};
    }
  }
`;

const CollapseAllDiv = styled('div')`
  cursor: pointer;
  font-family: TS3TextSans-Bold;
  font-size: 14px;
`;

const CollapseAllLabel = styled('div')`
  display: inline-block;
`;

const CollapseAllButton = ({
  front,
  closeAllCollections
}: CollectionOverviewCollapseAllButtonProps) => (
  <CollapseAllDiv
    onClick={e => {
      e.preventDefault();
      closeAllCollections(front.collections);
    }}
  >
    <ButtonCircularCaret small={true} active={true} preActive={false} />{' '}
    <CollapseAllLabel>Collapse all</CollapseAllLabel>
  </CollapseAllDiv>
);

const FrontCollectionsOverview = ({
  id,
  front,
  browsingStage,
  closeAllCollections
}: FrontCollectionOverviewProps) => (
  <Container setBack>
    <ContainerHeadingPinline>Overview</ContainerHeadingPinline>
    <CollapseAllButtonContainer>
      <CollapseAllButton
        front={front}
        closeAllCollections={closeAllCollections}
      />
    </CollapseAllButtonContainer>
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
  closeAllCollections: (collections: string[]) =>
    dispatch(closeCollections(collections))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FrontCollectionsOverview);
