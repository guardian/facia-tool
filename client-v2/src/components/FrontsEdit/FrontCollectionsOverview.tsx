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
import {
  selectIsFrontOverviewOpen,
  editorOpenOverview,
  editorCloseOverview
} from 'bundles/frontsUIBundle';

interface FrontContainerProps {
  id: string;
  browsingStage: CollectionItemSets;
}

type FrontCollectionOverviewProps = FrontContainerProps & {
  front: FrontConfig;
  closeAllCollections: (collections: string[]) => void;
  overviewIsOpen: boolean;
  toggleOverview: (open: boolean) => void;
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
  height: 100%;
  margin-left: 10px;
  ${({ isClosed }) => (isClosed ? 'padding: 0;' : '')}
`;

const ContainerBody = styled.div`
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
  closeAllCollections,
  overviewIsOpen,
  toggleOverview
}: FrontCollectionOverviewProps) => (
  <Container setBack isClosed={!overviewIsOpen}>
    <ContainerHeadingPinline>
      {overviewIsOpen && 'Overview'}
      <ButtonCircularCaret
        style={{
          margin: overviewIsOpen ? '0' : '10px'
        }}
        openDir="right"
        active={overviewIsOpen}
        preActive={false}
        onClick={() => toggleOverview(!overviewIsOpen)}
      />
    </ContainerHeadingPinline>
    {overviewIsOpen && (
      <>
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
      </>
    )}
  </Container>
);

const mapStateToProps = (state: State, props: FrontContainerProps) => ({
  front: getFront(state, props.id),
  overviewIsOpen: selectIsFrontOverviewOpen(state, props.id)
});

const mapDispatchToProps = (
  dispatch: Dispatch,
  props: FrontContainerProps
) => ({
  closeAllCollections: (collections: string[]) =>
    dispatch(closeCollections(collections)),
  toggleOverview: (open: boolean) =>
    dispatch(
      open ? editorOpenOverview(props.id) : editorCloseOverview(props.id)
    )
});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FrontCollectionsOverview);
