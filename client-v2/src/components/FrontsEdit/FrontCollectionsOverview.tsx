import React from 'react';
import { connect } from 'react-redux';
import { styled } from 'constants/theme';
import { State } from 'types/State';
import { Dispatch } from 'types/Store';
import { getFront } from 'selectors/frontsSelectors';
import { closeCollections } from 'actions/Collections';
import { FrontConfig } from 'types/FaciaApi';
import CollectionOverview from './CollectionOverview';
import { CollectionItemSets } from 'shared/types/Collection';
import ContainerHeadingPinline from 'shared/components/typography/ContainerHeadingPinline';
import ContentContainer from 'shared/components/layout/ContentContainer';
import ButtonCircularWithLabel from 'shared/components/input/ButtonCircularWithLabel';
import ButtonCircularCaret, {
  ButtonCircularWithTransition
} from 'shared/components/input/ButtonCircularCaret';

interface FrontContainerProps {
  id: string;
  browsingStage: CollectionItemSets;
}

type FrontCollectionOverviewProps = FrontContainerProps & {
  front: FrontConfig;
  closeAllCollections: (collections: string[]) => void;
};

const Container = styled(ContentContainer)`
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-left: 10px;
  width: 380px;
`;

const ContainerMeta = styled('div')`
  margin-top: 10px;
  width: 100%;
  display: flex;
  justify-content: flex-end;
`;

const CollapseAllButton = styled(ButtonCircularWithLabel)`
  :hover {
    ${ButtonCircularWithTransition} {
      background-color: ${({ theme }) =>
        theme.shared.button.backgroundColorFocused};
    }
  }
`;

const FrontCollectionsOverview = ({
  id,
  front,
  browsingStage,
  closeAllCollections
}: FrontCollectionOverviewProps) => (
  <Container setBack>
    <ContainerHeadingPinline>Overview</ContainerHeadingPinline>
    <ContainerMeta>
      <CollapseAllButton
        onClick={e => {
          e.preventDefault();
          closeAllCollections(front.collections);
        }}
        label={'Collapse all'}
      >
        <ButtonCircularCaret small active preActive={false} />
      </CollapseAllButton>
    </ContainerMeta>
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
