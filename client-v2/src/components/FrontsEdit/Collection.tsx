import React from 'react';
import { styled, Theme } from 'constants/theme';
import Collection from './CollectionComponents/Collection';
import { AlsoOnDetail } from 'types/Collection';
import { CardSets, Card as TCard } from 'shared/types/Collection';
import GroupDisplayComponent from 'shared/components/GroupDisplay';
import GroupLevel from 'components/clipboard/GroupLevel';
import Card from './CollectionComponents/Card';
import CardLevel from 'components/clipboard/CardLevel';
import { PosSpec, Move } from 'lib/dnd';
import { Dispatch } from 'types/Store';
import { removeCard as removeCardAction } from 'actions/Cards';
import { resetFocusState } from 'bundles/focusBundle';
import { connect } from 'react-redux';
import { State } from 'types/State';
import { createSelectArticleVisibilityDetails } from 'selectors/frontsSelectors';
import FocusWrapper from 'components/FocusWrapper';

const getArticleNotifications = (
  id: string,
  lastDesktopArticle?: string,
  lastMobileArticle?: string
) => {
  const notifications = [];
  if (lastDesktopArticle === id) {
    notifications.push('desktop');
  }
  if (lastMobileArticle === id) {
    notifications.push('mobile');
  }
  return notifications;
};

const CollectionWrapper = styled.div`
  & + & {
    margin-top: 10px;
  }
`;

const Notification = styled.span`
  display: inline-block;
  margin-left: 0.25em;
`;

const selectGrey = ({ theme }: { theme: Theme }) =>
  theme.shared.colors.greyMediumLight;

const VisibilityDividerEl = styled.div`
  display: flex;
  font-weight: bold;
  font-size: 12px;
  line-height: 1;
  margin: 0.5em 0;
  text-transform: capitalize;

  :before {
    background-image: linear-gradient(transparent 66.66666%, ${selectGrey} 66.66666%, ${selectGrey} 100%);
    background-position: 0px 2px;
    background-size: 3px 3px;
    content: '';
    display: block;
    flex: 1;
  }

  ${Notification} + ${Notification} {
    :before {
      color: ${selectGrey};
      content: '|';
      margin-right: 0.25em;
    }
  }
`;

const VisibilityDivider = ({ notifications }: { notifications: string[] }) =>
  notifications.length ? (
    <VisibilityDividerEl>
      {notifications.map(notification => (
        <Notification key={notification}>{notification}</Notification>
      ))}
    </VisibilityDividerEl>
  ) : null;

interface CollectionContextProps {
  id: string;
  frontId: string;
  priority: string;
  alsoOn: {
    [id: string]: AlsoOnDetail;
  };
  browsingStage: CardSets;
  size?: 'medium' | 'default' | 'wide';
  handleMove: (move: Move<TCard>) => void;
  handleInsert: (e: React.DragEvent, to: PosSpec) => void;
  selectCard: (id: string, isSupporting: boolean) => void;
}

interface ConnectedCollectionContextProps extends CollectionContextProps {
  handleArticleFocus: (
    e: React.FocusEvent<HTMLDivElement>,
    groupId: string,
    card: TCard,
    frontId: string
  ) => void;
  removeCard: (parentId: string, id: string) => void;
  removeSupportingCard: (parentId: string, id: string) => void;
  handleBlur: () => void;
  lastDesktopArticle?: string;
  lastMobileArticle?: string;
}

class CollectionContext extends React.Component<
  ConnectedCollectionContextProps
> {
  public render() {
    const {
      id,
      frontId,
      handleBlur,
      priority,
      alsoOn,
      browsingStage,
      size = 'default',
      handleMove,
      handleInsert,
      handleArticleFocus,
      selectCard,
      removeCard,
      removeSupportingCard,
      lastDesktopArticle,
      lastMobileArticle
    } = this.props;

    return (
      <CollectionWrapper data-testid="collection">
        <Collection
          key={id}
          id={id}
          priority={priority}
          frontId={frontId}
          alsoOn={alsoOn}
          canPublish={browsingStage !== 'live'}
          browsingStage={browsingStage}
        >
          {(group, isUneditable, showGroupName) => (
            <div key={group.uuid}>
              <GroupDisplayComponent
                key={group.uuid}
                groupName={showGroupName ? group.name : null}
              />
              <GroupLevel
                isUneditable={isUneditable}
                groupId={group.uuid}
                onMove={handleMove}
                onDrop={handleInsert}
                cardIds={group.cards}
              >
                {(card, getAfNodeProps) => (
                  <>
                    <FocusWrapper
                      tabIndex={0}
                      area="collection"
                      onBlur={() => handleBlur()}
                      onFocus={e =>
                        handleArticleFocus(e, group.uuid, card, frontId)
                      }
                      uuid={card.uuid}
                    >
                      <Card
                        frontId={frontId}
                        collectionId={id}
                        uuid={card.uuid}
                        parentId={group.uuid}
                        isUneditable={isUneditable}
                        size={size}
                        canShowPageViewData={true}
                        getNodeProps={() => getAfNodeProps(isUneditable)}
                        onSelect={() => selectCard(card.uuid, false)}
                        onDelete={() => removeCard(group.uuid, card.uuid)}
                      >
                        <CardLevel
                          isUneditable={isUneditable}
                          cardId={card.uuid}
                          onMove={handleMove}
                          onDrop={handleInsert}
                        >
                          {(supporting, getSupportingProps) => (
                            <Card
                              frontId={frontId}
                              uuid={supporting.uuid}
                              parentId={card.uuid}
                              canShowPageViewData={false}
                              onSelect={() => selectCard(supporting.uuid, true)}
                              isUneditable={isUneditable}
                              getNodeProps={() =>
                                getSupportingProps(isUneditable)
                              }
                              onDelete={() =>
                                removeSupportingCard(card.uuid, supporting.uuid)
                              }
                              size="small"
                            />
                          )}
                        </CardLevel>
                      </Card>
                    </FocusWrapper>
                    <VisibilityDivider
                      notifications={getArticleNotifications(
                        card.uuid,
                        lastDesktopArticle,
                        lastMobileArticle
                      )}
                    />
                  </>
                )}
              </GroupLevel>
            </div>
          )}
        </Collection>
      </CollectionWrapper>
    );
  }
}

const createMapStateToProps = () => {
  const selectArticleVisibilityDetails = createSelectArticleVisibilityDetails();
  return (state: State, props: CollectionContextProps) => {
    const articleVisibilityDetails = selectArticleVisibilityDetails(state, {
      collectionId: props.id,
      collectionSet: props.browsingStage
    });

    return {
      lastDesktopArticle: articleVisibilityDetails.desktop,
      lastMobileArticle: articleVisibilityDetails.mobile
    };
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  removeCard: (parentId: string, uuid: string) => {
    dispatch(removeCardAction('group', parentId, uuid, 'collection'));
  },
  removeSupportingCard: (parentId: string, uuid: string) => {
    dispatch(removeCardAction('card', parentId, uuid, 'collection'));
  },
  handleBlur: () => dispatch(resetFocusState())
});

export default connect(
  createMapStateToProps,
  mapDispatchToProps
)(CollectionContext);
