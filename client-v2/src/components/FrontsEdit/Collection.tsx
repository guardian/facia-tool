import React from 'react';
import { styled, Theme } from 'constants/theme';
import Collection from './CollectionComponents/Collection';
import { AlsoOnDetail } from 'types/Collection';
import {
  CollectionItemSets,
  ArticleFragment as TArticleFragment
} from 'shared/types/Collection';
import GroupDisplayComponent from 'shared/components/GroupDisplay';
import GroupLevel from 'components/clipboard/GroupLevel';
import CollectionItem from './CollectionComponents/CollectionItem';
import ArticleFragmentLevel from 'components/clipboard/ArticleFragmentLevel';
import { PosSpec, Move } from 'lib/dnd';
import { Dispatch } from 'types/Store';
import { removeArticleFragment } from 'actions/ArticleFragments';
import { resetFocusState } from 'bundles/focusBundle';
import { connect } from 'react-redux';
import { State } from 'types/State';
import { createArticleVisibilityDetailsSelector } from 'selectors/frontsSelectors';
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

const CollectionWrapper = styled('div')`
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
  browsingStage: CollectionItemSets;
  handleMove: (move: Move<TArticleFragment>) => void;
  handleInsert: (e: React.DragEvent, to: PosSpec) => void;
  selectArticleFragment: (isSupporting?: boolean) => (id: string) => void;
}

type ConnectedCollectionContextProps = CollectionContextProps & {
  handleArticleFocus: (
    e: React.FocusEvent<HTMLDivElement>,
    groupId: string,
    articleFragment: TArticleFragment,
    frontId: string
  ) => void;
  removeCollectionItem: (parentId: string, id: string) => void;
  removeSupportingCollectionItem: (parentId: string, id: string) => void;
  handleBlur: () => void;
  lastDesktopArticle?: string;
  lastMobileArticle?: string;
};

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
      handleMove,
      handleInsert,
      handleArticleFocus,
      selectArticleFragment,
      removeCollectionItem,
      removeSupportingCollectionItem,
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
                articleFragmentIds={group.articleFragments}
              >
                {(articleFragment, getAfNodeProps) => (
                  <>
                    <FocusWrapper
                      tabIndex={0}
                      area="collection"
                      onBlur={() => handleBlur()}
                      onFocus={e =>
                        handleArticleFocus(
                          e,
                          group.uuid,
                          articleFragment,
                          frontId
                        )
                      }
                      uuid={articleFragment.uuid}
                    >
                      <CollectionItem
                        frontId={this.props.frontId}
                        uuid={articleFragment.uuid}
                        parentId={group.uuid}
                        isUneditable={isUneditable}
                        getNodeProps={() => getAfNodeProps(isUneditable)}
                        onSelect={selectArticleFragment()}
                        onDelete={() =>
                          removeCollectionItem(group.uuid, articleFragment.uuid)
                        }
                      >
                        <ArticleFragmentLevel
                          isUneditable={isUneditable}
                          articleFragmentId={articleFragment.uuid}
                          onMove={handleMove}
                          onDrop={handleInsert}
                        >
                          {(supporting, getSupportingProps) => (
                            <CollectionItem
                              isSupporting={true}
                              frontId={this.props.frontId}
                              uuid={supporting.uuid}
                              parentId={articleFragment.uuid}
                              onSelect={selectArticleFragment(true)}
                              isUneditable={isUneditable}
                              getNodeProps={() =>
                                getSupportingProps(isUneditable)
                              }
                              onDelete={() =>
                                removeSupportingCollectionItem(
                                  articleFragment.uuid,
                                  supporting.uuid
                                )
                              }
                              size="small"
                            />
                          )}
                        </ArticleFragmentLevel>
                      </CollectionItem>
                    </FocusWrapper>
                    <VisibilityDivider
                      notifications={getArticleNotifications(
                        articleFragment.uuid,
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
  const articleVisibilityDetailsSelector = createArticleVisibilityDetailsSelector();
  return (state: State, props: CollectionContextProps) => {
    const articleVisibilityDetails = articleVisibilityDetailsSelector(state, {
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
  removeCollectionItem: (parentId: string, uuid: string) => {
    dispatch(removeArticleFragment('group', parentId, uuid, 'collection'));
  },
  removeSupportingCollectionItem: (parentId: string, uuid: string) => {
    dispatch(
      removeArticleFragment('articleFragment', parentId, uuid, 'collection')
    );
  },
  handleBlur: () => dispatch(resetFocusState())
});

export default connect(
  createMapStateToProps,
  mapDispatchToProps
)(CollectionContext);
