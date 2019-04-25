import { Dispatch } from 'types/Store';
import React, { RefObject } from 'react';
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
import {
  setFocusState,
  resetFocusState,
  selectFocusedArticle,
  selectIsClipboardFocused
} from 'bundles/focusBundle';

const ClipboardWrapper = styled('div')`
  border: 1px solid #c9c9c9;
  border-top: 1px solid black;
  overflow-y: scroll;
  &:focus {
    border: 1px solid ${({ theme }) => theme.shared.base.colors.focusColor};
    border-top: 1px solid ${({ theme }) => theme.shared.base.colors.focusColor};
    outline: none;
  }
`;

const ArticleWrapper = styled('div')<{ articleSelected?: boolean }>`
  border: ${({ articleSelected, theme }) =>
    articleSelected
      ? `1px solid ${theme.shared.base.colors.focusColor}`
      : `none`};
  &:focus {
    border: 1px solid ${({ theme }) => theme.shared.base.colors.focusColor};
    outline: none;
  }
`;

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
  flex: 1;
  display: flex;
`;

const StyledDragIntentContainer = styled(DragIntentContainer)`
  display: flex;
  flex-direction: column;
  min-height: 100%;
`;

const SupportingDivider = styled.hr`
  border: 0;
  border-top: 1px solid #ccc;
  margin: 0.5em 0 0.25em;
  width: 50%;
`;

interface ClipboardProps {
  selectArticleFragment: (id: string, isSupporting?: boolean) => void;
  clearArticleFragmentSelection: () => void;
  removeCollectionItem: (id: string) => void;
  removeSupportingCollectionItem: (parentId: string, id: string) => void;
  isClipboardOpen: boolean;
  toggleClipboard: (open: boolean) => void;
  handleFocus: () => void;
  handleArticleFocus: (articleFragment: TArticleFragment) => void;
  handleBlur: () => void;
  dispatch: Dispatch;
  focusedArticle?: string;
  isClipboardFocused: boolean;
}

// Styled component typings for ref seem to be broken so any refs
// passed to styled components has to be any for now.
type Ref = any;
type TClipboardWrapper = any;

class Clipboard extends React.Component<ClipboardProps> {
  public state = {
    preActive: false
  };

  private focusClipboardIfInFocus: () => void;
  private clipboardWrapper: RefObject<TClipboardWrapper>;

  constructor(props: ClipboardProps) {
    super(props);

    this.clipboardWrapper = React.createRef<TClipboardWrapper>();

    this.focusClipboardIfInFocus = () => {
      if (this.props.isClipboardFocused && this.clipboardWrapper.current) {
        this.clipboardWrapper.current.focus();
      }
    };
  }

  public componentDidUpdate() {
    this.focusClipboardIfInFocus();
  }

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
      <ClipboardWrapper
        tabIndex={0}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        innerRef={this.clipboardWrapper as Ref}
      >
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
              tabIndex={-1}
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
                  flex: '1',
                  width: '140px'
                }}
              >
                <ClipboardLevel
                  onMove={this.handleMove}
                  onDrop={this.handleInsert}
                >
                  {(articleFragment, afProps) => (
                    <ArticleWrapper
                      tabIndex={0}
                      onFocus={e => this.handleArticleFocus(e, articleFragment)}
                      onBlur={this.handleBlur}
                      articleSelected={
                        this.props.focusedArticle === articleFragment.uuid
                      }
                    >
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
                          {(supporting, sProps, i, arr) => (
                            <>
                              {i < arr.length ? <SupportingDivider /> : null}
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
                            </>
                          )}
                        </ArticleFragmentLevel>
                      </CollectionItem>
                    </ArticleWrapper>
                  )}
                </ClipboardLevel>
              </Root>
            )}
          </ClipboardBody>
        </StyledDragIntentContainer>
      </ClipboardWrapper>
    );
  }

  private handleFocus = (e: React.FocusEvent<HTMLDivElement>) =>
    this.props.handleFocus();
  private handleBlur = () => this.props.handleBlur();

  private handleArticleFocus = (
    e: React.FocusEvent<HTMLDivElement>,
    articleFragment: TArticleFragment
  ) => {
    this.props.handleArticleFocus(articleFragment);
    e.stopPropagation();
  };
}

const mapStateToProps = (state: State) => ({
  isClipboardOpen: selectIsClipboardOpen(state),
  focusedArticle: selectFocusedArticle(state, 'clipboardArticle'),
  isClipboardFocused: selectIsClipboardFocused(state)
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
  handleFocus: () =>
    dispatch(
      setFocusState({
        type: 'clipboard'
      })
    ),
  handleArticleFocus: (articleFragment: TArticleFragment) => {
    dispatch(
      setFocusState({
        type: 'clipboardArticle',
        articleFragment
      })
    );
  },
  handleBlur: () => dispatch(resetFocusState()),
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
