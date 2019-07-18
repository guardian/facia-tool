import React from 'react';
import { connect } from 'react-redux';
import { styled } from 'constants/theme';
import { events } from 'services/GA';

import { State } from 'types/State';
import { Dispatch } from 'types/Store';
import { selectHasUnpublishedChanges } from 'selectors/frontsSelectors';
import { openCollectionsAndFetchTheirArticles } from 'actions/Collections';

import { Collection, CollectionItemSets } from 'shared/types/Collection';
import { createCollectionId } from 'shared/components/Collection';
import ButtonDefault from 'shared/components/input/ButtonCircular';
import {
  createSelectCollection,
  selectSharedState,
  createSelectArticlesInCollection
} from 'shared/selectors/shared';
import EditModeVisibility from 'components/util/EditModeVisibility';

interface FrontCollectionOverviewContainerProps {
  frontId: string;
  collectionId: string;
  browsingStage: CollectionItemSets;
  isSelected: boolean;
}

type FrontCollectionOverviewProps = FrontCollectionOverviewContainerProps & {
  collection: Collection | undefined;
  articleCount: number;
  openCollection: (id: string) => void;
  hasUnpublishedChanges: boolean;
};

const Container = styled.div<{ isSelected: boolean }>`
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

  ${props =>
    props.isSelected &&
    `background-color: ${props.theme.shared.colors.whiteDark}`}

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
  font-weight: bold;
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
  hasUnpublishedChanges,
  isSelected
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
      isSelected={isSelected}
    >
      <TextContainerLeft>
        <Name>{collection.displayName}</Name>
        <ItemCount>({articleCount})</ItemCount>
      </TextContainerLeft>
      <TextContainerRight>
        {collection &&
          collection.lastUpdated &&
          (!!hasUnpublishedChanges ? (
            <EditModeVisibility visibleMode="fronts">
              <StatusWarning
                priority="primary"
                size="s"
                title="Collection changes have not been launched"
              >
                !
              </StatusWarning>
            </EditModeVisibility>
          ) : null)}
      </TextContainerRight>
    </Container>
  ) : null;

const mapStateToProps = () => {
  const selectCollection = createSelectCollection();
  const selectArticlesInCollection = createSelectArticlesInCollection();

  return (state: State, props: FrontCollectionOverviewContainerProps) => ({
    collection: selectCollection(selectSharedState(state), {
      collectionId: props.collectionId
    }),
    articleCount: selectArticlesInCollection(selectSharedState(state), {
      collectionSet: props.browsingStage,
      collectionId: props.collectionId,
      includeSupportingArticles: false
    }).length,
    hasUnpublishedChanges: selectHasUnpublishedChanges(state, {
      collectionId: props.collectionId
    }),
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
