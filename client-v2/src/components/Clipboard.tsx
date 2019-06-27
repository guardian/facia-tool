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
  selectIsClipboardOpen
} from 'bundles/frontsUIBundle';
import { clipboardId } from 'constants/fronts';
import {
  ArticleFragment as TArticleFragment,
  ArticleFragmentMeta,
  ArticleFragment
} from 'shared/types/Collection';
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

const hasSupporting = (af: ArticleFragment) =>
  !!(af.meta.supporting || []).length;

const ClipboardWrapper = styled<
  HTMLProps<HTMLDivElement> & { 'data-testid'?: string },
  'div'
>('div').attrs({
  'data-testid': 'clipboard-wrapper'
})`
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

const FullDivider = styled('hr')`
  border: 0;
  border-top: 1px solid #ccc;
  margin: 8px -10px 0px;
  width: 115%;
`;

interface ClipboardProps {
  selectArticleFragment: (id: string, isSupporting?: boolean) => void;
  removeCollectionItem: (id: string) => void;
  removeSupportingCollectionItem: (parentId: string, id: string) => void;
  isClipboardOpen: boolean;
  handleFocus: () => void;
  handleArticleFocus: (articleFragment: TArticleFragment) => void;
  handleBlur: () => void;
  dispatch: Dispatch;
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
      <React.Fragment>
        {this.props.isClipboardOpen && (
          <ClipboardWrapper
            tabIndex={0}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
            innerRef={this.clipboardWrapper as Ref}
          >
            <StyledDragIntentContainer
              active={!this.props.isClipboardOpen}
              delay={300}
              onDragIntentStart={() => this.setState({ preActive: true })}
              onDragIntentEnd={() => this.setState({ preActive: false })}
            >
              <ClipboardBody>
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
                            displayType="polaroid"
                            onSelect={this.props.selectArticleFragment}
                            onDelete={() =>
                              this.props.removeCollectionItem(
                                articleFragment.uuid
                              )
                            }
                          >
                            {hasSupporting(articleFragment) && (
                              <SupportingDivider />
                            )}
                            <ArticleFragmentLevel
                              articleFragmentId={articleFragment.uuid}
                              onMove={this.handleMove}
                              onDrop={this.handleInsert}
                              displayType="polaroid"
                            >
                              {(supporting, getSProps, i, arr) => (
                                <CollectionItem
                                  uuid={supporting.uuid}
                                  frontId={clipboardId}
                                  parentId={articleFragment.uuid}
                                  getNodeProps={getSProps}
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
                                >
                                  {i < arr.length - 1 ? (
                                    <SupportingDivider />
                                  ) : null}
                                </CollectionItem>
                              )}
                            </ArticleFragmentLevel>
                          </CollectionItem>
                        </FocusWrapper>
                        <FullDivider />
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

const mapStateToProps = (state: State) => ({
  isClipboardOpen: selectIsClipboardOpen(state),
  isClipboardFocused: selectIsClipboardFocused(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  selectArticleFragment: (articleFragmentId: string, isSupporting?: boolean) =>
    dispatch(
      editorSelectArticleFragment(
        articleFragmentId,
        clipboardId,
        clipboardId,
        !!isSupporting
      )
    ),
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Clipboard);
