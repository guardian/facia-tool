import { Dispatch } from 'types/Store';
import React, { RefObject, HTMLProps } from 'react';
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
  createSelectCollectionIdsWithOpenForms
} from 'bundles/frontsUIBundle';
import { clipboardId } from 'constants/fronts';
import { ArticleFragment as TArticleFragment } from 'shared/types/Collection';
import ClipboardLevel from './clipboard/ClipboardLevel';
import ArticleFragmentLevel from './clipboard/ArticleFragmentLevel';
import CollectionItem from './FrontsEdit/CollectionComponents/CollectionItem';
import { styled } from 'constants/theme';
import DragIntentContainer from 'shared/components/DragIntentContainer';
import {
  setFocusState,
  resetFocusState,
  selectIsClipboardFocused
} from 'bundles/focusBundle';
import FocusWrapper from './FocusWrapper';
import { bindActionCreators } from 'redux';
import ButtonRoundedWithLabel, {
  ButtonLabel
} from 'shared/components/input/ButtonRoundedWithLabel';
import { clearClipboardWithPersist } from 'actions/Clipboard';

const ClipboardWrapper = styled<
  HTMLProps<HTMLDivElement> & {
    'data-testid'?: string;
    clipboardHasOpenForms: boolean;
  },
  'div'
>('div').attrs({
  'data-testid': 'clipboard-wrapper'
})`
  width: ${({ theme, clipboardHasOpenForms }) =>
    clipboardHasOpenForms ? theme.front.minWidth : 220}px;
  background: ${({ theme }) => theme.shared.collection.background};
  border-top: 1px solid ${({ theme }) => theme.shared.colors.greyLightPinkish};
  overflow-y: scroll;
  &:focus {
    border: 1px solid ${({ theme }) => theme.shared.base.colors.focusColor};
    border-top: 1px solid ${({ theme }) => theme.shared.base.colors.focusColor};
    outline: none;
  }
`;

const ClipboardBody = styled.div`
  padding: 0 10px;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const StyledDragIntentContainer = styled(DragIntentContainer)`
  display: flex;
  flex-direction: column;
  min-height: 100%;
`;

const ClipboardHeader = styled.div`
  display: flex;
  height: 35px;
  padding-top: 15px;
`;

const ClearClipboardButton = styled(ButtonRoundedWithLabel)`
  margin-left: auto;
`;

interface ClipboardProps {
  selectArticleFragment: (id: string, isSupporting?: boolean) => void;
  clearArticleFragmentSelection: () => void;
  removeCollectionItem: (id: string) => void;
  removeSupportingCollectionItem: (parentId: string, id: string) => void;
  clearClipboard: () => void;
  handleFocus: () => void;
  handleArticleFocus: (articleFragment: TArticleFragment) => void;
  handleBlur: () => void;
  dispatch: Dispatch;
  isClipboardOpen: boolean;
  isClipboardFocused: boolean;
  clipboardHasOpenForms: boolean;
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
    const {
      isClipboardOpen,
      clipboardHasOpenForms,
      selectArticleFragment,
      removeCollectionItem,
      removeSupportingCollectionItem
    } = this.props;
    return (
      <React.Fragment>
        {isClipboardOpen && (
          <ClipboardWrapper
            tabIndex={0}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
            innerRef={this.clipboardWrapper as Ref}
            clipboardHasOpenForms={clipboardHasOpenForms}
          >
            <StyledDragIntentContainer
              active={!isClipboardOpen}
              delay={300}
              onDragIntentStart={() => this.setState({ preActive: true })}
              onDragIntentEnd={() => this.setState({ preActive: false })}
            >
              <ClipboardBody>
                <ClipboardHeader>
                  <ClearClipboardButton onClick={this.props.clearClipboard}>
                    <ButtonLabel>Clear clipboard</ButtonLabel>
                  </ClearClipboardButton>
                </ClipboardHeader>
                <Root
                  id="clipboard"
                  data-testid="clipboard"
                  style={{ display: 'flex', flex: 1 }}
                >
                  <ClipboardLevel
                    onMove={this.handleMove}
                    onDrop={this.handleInsert}
                  >
                    {(articleFragment, getAfProps) => (
                      <>
                        <FocusWrapper
                          tabIndex={0}
                          onFocus={e =>
                            this.handleArticleFocus(e, articleFragment)
                          }
                          area="clipboard"
                          onBlur={this.handleBlur}
                          uuid={articleFragment.uuid}
                        >
                          <CollectionItem
                            uuid={articleFragment.uuid}
                            parentId={clipboardId}
                            frontId={clipboardId}
                            getNodeProps={getAfProps}
                            showMeta={false}
                            canDragImage={false}
                            textSize="small"
                            onSelect={selectArticleFragment}
                            onDelete={() =>
                              removeCollectionItem(articleFragment.uuid)
                            }
                          >
                            <ArticleFragmentLevel
                              articleFragmentId={articleFragment.uuid}
                              onMove={this.handleMove}
                              onDrop={this.handleInsert}
                            >
                              {(supporting, getSProps, i, arr) => (
                                <CollectionItem
                                  uuid={supporting.uuid}
                                  frontId={clipboardId}
                                  parentId={articleFragment.uuid}
                                  getNodeProps={getSProps}
                                  size="small"
                                  showMeta={false}
                                  onSelect={id =>
                                    selectArticleFragment(id, true)
                                  }
                                  onDelete={() =>
                                    removeSupportingCollectionItem(
                                      articleFragment.uuid,
                                      supporting.uuid
                                    )
                                  }
                                />
                              )}
                            </ArticleFragmentLevel>
                          </CollectionItem>
                        </FocusWrapper>
                      </>
                    )}
                  </ClipboardLevel>
                </Root>
              </ClipboardBody>
            </StyledDragIntentContainer>
          </ClipboardWrapper>
        )}
      </React.Fragment>
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

const mapStateToProps = () => {
  const selectCollectionIdsWithOpenForms = createSelectCollectionIdsWithOpenForms();
  return (state: State) => ({
    isClipboardOpen: selectIsClipboardOpen(state),
    isClipboardFocused: selectIsClipboardFocused(state),
    clipboardHasOpenForms: !!selectCollectionIdsWithOpenForms(
      state,
      clipboardId
    ).length
  });
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
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
  clearClipboard: () => {
    dispatch(clearClipboardWithPersist(clipboardId));
  },
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
  ...bindActionCreators(
    {
      selectArticleFragment: editorSelectArticleFragment,
      updateArticleFragmentMeta,
      handleBlur: resetFocusState
    },
    dispatch
  ),
  dispatch
});

type TStateProps = ReturnType<ReturnType<typeof mapStateToProps>>;
type TDispatchProps = ReturnType<typeof mapDispatchToProps>;

const mergeProps = (
  stateProps: TStateProps,
  dispatchProps: TDispatchProps
) => ({
  ...stateProps,
  ...dispatchProps,
  selectArticleFragment: (articleId: string, isSupporting = false) =>
    dispatchProps.selectArticleFragment(
      articleId,
      clipboardId, // clipboardId is passed twice here as both the collection ID...
      clipboardId, // and the front ID
      isSupporting
    )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(Clipboard);
