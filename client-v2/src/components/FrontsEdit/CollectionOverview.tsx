import React from 'react';
import { connect } from 'react-redux';
import { styled } from 'constants/theme';
import { events } from 'services/GA';

import { State } from 'types/State';
import { Dispatch } from 'types/Store';
import { hasUnpublishedChangesSelector } from 'selectors/frontsSelectors';
import { openCollectionsAndFetchTheirArticles } from 'actions/Collections';

import { Collection, CollectionItemSets } from 'shared/types/Collection';
import { createCollectionId } from 'shared/components/Collection';
import ButtonDefault from 'shared/components/input/ButtonCircular';

import {
  createCollectionSelector,
  selectSharedState,
  createArticlesInCollectionSelector
} from 'shared/selectors/shared';

interface FrontCollectionOverviewContainerProps {
  frontId: string;
  collectionId: string;
  browsingStage: CollectionItemSets;
}

type FrontCollectionOverviewProps = FrontCollectionOverviewContainerProps & {
  collection: Collection | undefined;
  articleCount: number;
  openCollection: (id: string) => void;
  hasUnpublishedChanges: boolean;
};

const Container = styled.div`
  align-items: center;
  appearance: none;
  background-color: ${({ theme }) => theme.shared.base.colors.backgroundColor};
  border: ${({ theme }) => `solid 1px ${theme.shared.base.colors.borderColor}`};
  border-radius: 1.25em;
  color: inherit;
  cursor: pointer;
  display: flex;
  font-family: TS3TextSans;
  font-size: 14px;
  min-height: 2.5em;
  margin-top: 0.75em;
  padding: 0.55em 0.75em;
  text-align: left;
  text-decoration: none;
  transition: background-color 0.3s;

  &:hover {
    background-color: ${({ theme }) => theme.shared.colors.whiteDark};
  }

  &:focus {
    outline: none;
  }
`;

const TextContainerLeft = styled.div`
  flex: 1 1;
  font-size: 14px;
`;

const TextContainerRight = styled.div`
  flex: 0 0 auto;
  font-size: 14px;
  overflow: hidden;
  white-space: nowrap;
`;

const Name = styled.span`
  color: ${({ theme }) => theme.shared.base.colors.text};
  font-weight: 700;
  padding-right: 0.25em;
`;

const ItemCount = styled.span`
  white-space: nowrap;
`;

const StatusWarning = ButtonDefault.extend`
  outline: transparent;
  :not(:first-child) {
    margin-left: 5px;
  }
  color: ${({ theme }) => theme.shared.button.color};
  height: 20px;
  width: 20px;
  border-radius: 20px;
  &:hover,
  &:active {
    outline: transparent;
  }
`;

const CollectionOverview = ({
  collection,
  articleCount,
  openCollection,
  frontId,
  hasUnpublishedChanges
}: FrontCollectionOverviewProps) =>
  collection ? (
    <Container
      onClick={e => {
        e.preventDefault();
        events.overviewItemClicked(frontId);
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
      <TextContainerLeft>
        <Name>{collection.displayName}</Name>
        <ItemCount>({articleCount})</ItemCount>
      </TextContainerLeft>
      <TextContainerRight>
        {collection &&
          collection.lastUpdated &&
          (!!hasUnpublishedChanges ? (
            <StatusWarning
              priority="primary"
              size="s"
              title="Collection changes have not been launched"
            >
              !
            </StatusWarning>
          ) : null)}
      </TextContainerRight>
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
      collectionId: props.collectionId,
      includeSupportingArticles: false
    }).length,
    hasUnpublishedChanges: hasUnpublishedChangesSelector(state, {
      collectionId: props.collectionId
    })
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
