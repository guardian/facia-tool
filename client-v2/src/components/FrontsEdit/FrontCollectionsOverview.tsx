import React from 'react';
import { connect } from 'react-redux';
import { styled, theme } from 'constants/theme';
import { State } from 'types/State';
import { selectFront } from 'selectors/frontsSelectors';
import { FrontConfig } from 'types/FaciaApi';
import CollectionOverview from './CollectionOverview';
import { CollectionItemSets } from 'shared/types/Collection';
import ContainerHeadingPinline from 'shared/components/typography/ContainerHeadingPinline';
import ContentContainer from 'shared/components/layout/ContentContainer';
import { updateArticleFragmentMeta as updateArticleFragmentMetaAction } from 'actions/ArticleFragments';
import { editorClearArticleFragmentSelection } from 'bundles/frontsUIBundle';
import { bindActionCreators } from 'redux';
import { Dispatch } from 'types/Store';

interface FrontContainerProps {
  id: string;
}

type FrontCollectionOverviewProps = FrontContainerProps & {
  front: FrontConfig;
  browsingStage: CollectionItemSets;
  currentCollection: string | undefined;
};

interface ContainerProps {
  isClosed: boolean;
}

const Container = styled(ContentContainer)<ContainerProps>`
  border: ${({ isClosed }) =>
    isClosed ? `1px solid ${theme.shared.base.colors.borderColor}` : 'none'};
  border-top: none;
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-left: 10px;
  max-height: calc(100% - 43px);
  overflow-y: scroll;
  padding: 0;
  ${({ isClosed }) => (isClosed ? 'padding: 0; height: 100%' : '')}
`;

const ContainerBody = styled.div`
  width: ${theme.front.overviewMinWidth}px;
  overflow-y: scroll;
  padding-bottom: ${theme.front.paddingForAddFrontButton}px;
`;

const OverviewContainerHeadingPinline = styled(ContainerHeadingPinline)`
  font-family: TS3TextSans;
  font-size: 15px;
  font-weight: bold;
  line-height: normal;
  padding-bottom: 5px;
`;

const FrontCollectionsOverview = ({
  id,
  front,
  browsingStage,
  currentCollection
}: FrontCollectionOverviewProps) => (
  <Container setBack isClosed={false}>
    <OverviewContainerHeadingPinline>Overview</OverviewContainerHeadingPinline>
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

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      updateArticleFragmentMeta: updateArticleFragmentMetaAction,
      clearArticleFragmentSelection: editorClearArticleFragmentSelection
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FrontCollectionsOverview);
