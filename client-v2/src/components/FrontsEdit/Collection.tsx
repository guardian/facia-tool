import React from 'react';
import { styled } from 'constants/theme';
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
import { ValidationResponse } from 'shared/util/validateImageSrc';
import { Dispatch } from 'types/Store';
import {
  removeArticleFragment,
  addImageToArticleFragment
} from 'actions/ArticleFragments';
import { resetFocusState, setFocusState } from 'bundles/focusBundle';
import { connect } from 'react-redux';
import { State } from 'types/State';
import { createArticleVisiblityDetailsSelector } from 'selectors/frontsSelectors';

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
  &:focus {
    border: 1px solid ${props => props.theme.shared.base.colors.focusColor};
    border-top: 2px solid ${props => props.theme.shared.base.colors.focusColor};
    border-bottom: 2px solid
      ${props => props.theme.shared.base.colors.focusColor};
    outline: none;
  }
`;

const CollectionItemWrapper = styled('div')<{ articleSelected?: boolean }>`
  border: ${props =>
    props.articleSelected
      ? `1px solid ${props.theme.shared.base.colors.focusColor}`
      : `none`};
  &:focus {
    border: 1px solid ${props => props.theme.shared.base.colors.focusColor};
    outline: none;
  }
`;

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
  focusedArticle?: string;
  selectArticleFragment: (isSupporting?: boolean) => (id: string) => void;
}

type ConnectedCollectionContextProps = CollectionContextProps & {
  handleArticleFocus: (
    e: React.FocusEvent<HTMLDivElement>,
    groupId: string,
    articleFragment: TArticleFragment,
    frontId: string
  ) => void;
  addImageToArticleFragment: (id: string, response: ValidationResponse) => void;
  removeCollectionItem: (parentId: string, id: string) => void;
  removeSupportingCollectionItem: (parentId: string, id: string) => void;
  handleFocus: (id: string) => void;
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
      handleFocus,
      priority,
      alsoOn,
      browsingStage,
      handleMove,
      handleInsert,
      handleArticleFocus,
      selectArticleFragment,
      removeCollectionItem,
      removeSupportingCollectionItem,
      focusedArticle,
      lastDesktopArticle,
      lastMobileArticle
    } = this.props;
    return (
      <CollectionWrapper
        tabIndex={0}
        onBlur={() => handleBlur()}
        onFocus={() => handleFocus(id)}
      >
        <Collection
          key={id}
          id={id}
          priority={priority}
          frontId={frontId}
          alsoOn={alsoOn}
          canPublish={browsingStage !== 'live'}
          browsingStage={browsingStage}
        >
          {(group, isUneditable) => (
            <GroupDisplayComponent key={group.uuid} groupName={group.name}>
              <GroupLevel
                isUneditable={isUneditable}
                groupId={group.uuid}
                onMove={handleMove}
                onDrop={handleInsert}
              >
                {(articleFragment, afDragProps) => (
                  <CollectionItemWrapper
                    tabIndex={0}
                    onBlur={() => handleBlur()}
                    onFocus={e =>
                      handleArticleFocus(
                        e,
                        group.uuid,
                        articleFragment,
                        frontId
                      )
                    }
                    articleSelected={focusedArticle === articleFragment.uuid}
                  >
                    <CollectionItem
                      frontId={this.props.id}
                      onImageDrop={imageData => {
                        this.props.addImageToArticleFragment(
                          articleFragment.uuid,
                          imageData
                        );
                      }}
                      uuid={articleFragment.uuid}
                      parentId={group.uuid}
                      isUneditable={isUneditable}
                      getNodeProps={() => (!isUneditable ? afDragProps : {})}
                      onSelect={selectArticleFragment()}
                      onDelete={() =>
                        removeCollectionItem(group.uuid, articleFragment.uuid)
                      }
                      articleNotifications={getArticleNotifications(
                        articleFragment.uuid,
                        lastDesktopArticle,
                        lastMobileArticle
                      )}
                    >
                      <ArticleFragmentLevel
                        isUneditable={isUneditable}
                        articleFragmentId={articleFragment.uuid}
                        onMove={handleMove}
                        onDrop={handleInsert}
                      >
                        {(supporting, supportingDragProps) => (
                          <CollectionItem
                            frontId={this.props.id}
                            uuid={supporting.uuid}
                            parentId={articleFragment.uuid}
                            onSelect={selectArticleFragment(true)}
                            isUneditable={isUneditable}
                            getNodeProps={() =>
                              !isUneditable ? supportingDragProps : {}
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
                  </CollectionItemWrapper>
                )}
              </GroupLevel>
            </GroupDisplayComponent>
          )}
        </Collection>
      </CollectionWrapper>
    );
  }
}

const createMapStateToProps = () => {
  const articleVisiblityDetailsSelector = createArticleVisiblityDetailsSelector();
  return (state: State, props: CollectionContextProps) => {
    const articleVisiblityDetails = articleVisiblityDetailsSelector(state, {
      collectionId: props.id,
      collectionSet: props.browsingStage
    });
    return {
      lastDesktopArticle: articleVisiblityDetails.desktop,
      lastMobileArticle: articleVisiblityDetails.mobile
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
  addImageToArticleFragment: (id: string, response: ValidationResponse) =>
    dispatch(addImageToArticleFragment(id, response)),
  handleBlur: () => dispatch(resetFocusState()),
  handleFocus: (collectionId: string) =>
    dispatch(setFocusState({ type: 'collection', collectionId }))
});

export default connect(
  createMapStateToProps,
  mapDispatchToProps
)(CollectionContext);
