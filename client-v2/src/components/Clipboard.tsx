import { Dispatch } from 'types/Store';
import React from 'react';
import { connect } from 'react-redux';
import { Root, Move, PosSpec } from 'lib/dnd';
import { State } from 'types/State';
import { insertArticleFragmentFromDropEvent } from 'util/collectionUtils';
import {
  moveArticleFragment,
  removeArticleFragment,
  updateArticleFragmentMeta
} from 'actions/ArticleFragments';
import {
  editorSelectArticleFragment,
  editorClearArticleFragmentSelection,
  selectIsClipboardOpen,
  editorOpenClipboard,
  editorCloseClipboard
} from 'bundles/frontsUIBundle';
import { clipboardId } from 'constants/fronts';
import {
  ArticleFragment as TArticleFragment,
  ArticleFragmentMeta
} from 'shared/types/Collection';
import ClipboardLevel from './clipboard/ClipboardLevel';
import ArticleFragmentLevel from './clipboard/ArticleFragmentLevel';
import CollectionItem from './FrontsEdit/CollectionComponents/CollectionItem';
import { styled } from 'constants/theme';
import ButtonCircularCaret from 'shared/components/input/ButtonCircularCaret';
import DragIntentContainer from 'shared/components/DragIntentContainer';

const ClipboardHeader = styled.div`
  align-items: center;
  justify-content: space-between;
  border-bottom: ${({ theme }) =>
    `1px solid ${theme.shared.base.colors.borderColor}`};
  display: flex;
  padding: 10px;
`;

const ClipboardTitle = styled.h2`
  font-size: 14px;
  line-height: 1;
  margin: 0;
`;

const ClipboardBody = styled.div`
  padding: 10px;
  flex-basis: 100%;
  display: flex;
`;

const StyledDragIntentContainer = styled(DragIntentContainer)`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

interface ClipboardProps {
  selectArticleFragment: (id: string, isSupporting?: boolean) => void;
  clearArticleFragmentSelection: () => void;
  removeCollectionItem: (id: string) => void;
  removeSupportingCollectionItem: (parentId: string, id: string) => void;
  isClipboardOpen: boolean;
  toggleClipboard: (open: boolean) => void;
  dispatch: Dispatch;
}

class Clipboard extends React.Component<ClipboardProps> {
  public state = {
    preActive: false
  };
  // TODO: this code is repeated in src/components/FrontsEdit/Front.js
  // refactor

  public handleMove = (move: Move<TArticleFragment>) => {
    this.props.dispatch(
      moveArticleFragment(move.to, move.data, move.from || null, 'clipboard')
    );
  };

  public handleInsert = (e: React.DragEvent, to: PosSpec) => {
    this.props.dispatch(insertArticleFragmentFromDropEvent(e, to, 'clipboard'));
  };

  public render() {
    return (
      <StyledDragIntentContainer
        active={!this.props.isClipboardOpen}
        onDragIntentStart={() => this.setState({ preActive: true })}
        onDragIntentEnd={() => this.setState({ preActive: false })}
        onIntentConfirm={() => this.props.toggleClipboard(true)}
      >
        <ClipboardHeader>
          {this.props.isClipboardOpen && (
            <ClipboardTitle>Clipboard</ClipboardTitle>
          )}
          <ButtonCircularCaret
            openDir="right"
            active={this.props.isClipboardOpen}
            preActive={this.state.preActive}
            onClick={() =>
              this.props.toggleClipboard(!this.props.isClipboardOpen)
            }
          />
        </ClipboardHeader>
        <ClipboardBody>
          {this.props.isClipboardOpen && (
            <Root
              id="clipboard"
              data-testid="clipboard"
              style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                width: '160px'
              }}
            >
              <ClipboardLevel
                onMove={this.handleMove}
                onDrop={this.handleInsert}
              >
                {(articleFragment, afProps) => (
                  <CollectionItem
                    uuid={articleFragment.uuid}
                    parentId={clipboardId}
                    frontId={clipboardId}
                    getNodeProps={() => afProps}
                    displayType="polaroid"
                    onSelect={this.props.selectArticleFragment}
                    onDelete={() =>
                      this.props.removeCollectionItem(articleFragment.uuid)
                    }
                    {...afProps}
                  >
                    <ArticleFragmentLevel
                      articleFragmentId={articleFragment.uuid}
                      onMove={this.handleMove}
                      onDrop={this.handleInsert}
                      displayType="polaroid"
                    >
                      {(supporting, sProps) => (
                        <CollectionItem
                          uuid={supporting.uuid}
                          frontId={clipboardId}
                          parentId={articleFragment.uuid}
                          getNodeProps={() => sProps}
                          size="small"
                          displayType="polaroid"
                          onSelect={id =>
                            this.props.selectArticleFragment(id, true)
                          }
                          onDelete={() =>
                            this.props.removeSupportingCollectionItem(
                              articleFragment.uuid,
                              supporting.uuid
                            )
                          }
                        />
                      )}
                    </ArticleFragmentLevel>
                  </CollectionItem>
                )}
              </ClipboardLevel>
            </Root>
          )}
        </ClipboardBody>
      </StyledDragIntentContainer>
    );
  }
}

const mapStateToProps = (state: State) => ({
  isClipboardOpen: selectIsClipboardOpen(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  selectArticleFragment: (
    frontId: string,
    articleFragmentId: string,
    isSupporting: boolean
  ) =>
    dispatch(
      editorSelectArticleFragment(frontId, articleFragmentId, isSupporting)
    ),
  clearArticleFragmentSelection: () =>
    dispatch(editorClearArticleFragmentSelection(clipboardId)),
  removeCollectionItem: (uuid: string) => {
    dispatch(
      removeArticleFragment('clipboard', 'clipboard', uuid, 'clipboard')
    );
  },
  removeSupportingCollectionItem: (parentId: string, uuid: string) => {
    dispatch(
      removeArticleFragment('articleFragment', parentId, uuid, 'clipboard')
    );
  },
  toggleClipboard: (open: boolean) =>
    dispatch(open ? editorOpenClipboard() : editorCloseClipboard()),
  updateArticleFragmentMeta: (id: string, meta: ArticleFragmentMeta) =>
    dispatch(updateArticleFragmentMeta(id, meta)),
  dispatch
});

type TStateProps = ReturnType<typeof mapStateToProps>;
type TDispatchProps = ReturnType<typeof mapDispatchToProps>;

const mergeProps = (
  stateProps: TStateProps,
  dispatchProps: TDispatchProps
) => ({
  ...stateProps,
  ...dispatchProps,
  selectArticleFragment: (articleId: string, isSupporting = false) =>
    dispatchProps.selectArticleFragment(clipboardId, articleId, isSupporting)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(Clipboard);
