import React from 'react';
import { styled } from 'constants/theme';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { State } from 'types/State';
import { Dispatch } from 'types/Store';
import {
  editorSelectArticleFragment,
  editorOpenOverview,
  editorCloseOverview,
  selectIsFrontOverviewOpen,
  editorOpenAllCollectionsForFront,
  editorCloseAllCollectionsForFront
} from 'bundles/frontsUIBundle';
import {
  CollectionItemSets,
  ArticleFragment as TArticleFragment
} from 'shared/types/Collection';
import { initialiseCollectionsForFront } from 'actions/Collections';
import { setFocusState } from 'bundles/focusBundle';
import { theme as sharedTheme } from 'shared/constants/theme';
import ButtonCircularCaret from 'shared/components/input/ButtonCircularCaret';
import ButtonRoundedWithLabel, {
  ButtonLabel
} from 'shared/components/input/ButtonRoundedWithLabel';
import { DownCaretIcon } from 'shared/components/icons/Icons';
import FrontCollectionsOverview from './FrontCollectionsOverview';
import FrontContent from './FrontContent';

const FrontWrapper = styled.div`
  height: 100%;
  display: flex;
`;

const SectionContentMetaContainer = styled.div`
  display: flex;
  flex-shrink: 0;
  justify-content: flex-end;
  margin-right: 5px;
`;

const OverviewToggleContainer = styled.div<{ active: boolean }>`
  font-size: 13px;
  font-weight: bold;
  padding-left: 10px;
  padding-top: 3px;
  border-left: ${({ theme }) =>
    `solid 1px  ${theme.shared.colors.greyVeryLight}`};
  padding-top: 13px;
  padding-bottom: 10px;
  text-align: right;
  margin-left: ${props => (props.active ? '0' : '-1px')};
  cursor: pointer;
`;

const OverviewHeading = styled.label`
  margin-right: 5px;
  cursor: pointer;
`;

const OverviewHeadingButton = styled(ButtonRoundedWithLabel)`
  & svg {
    vertical-align: middle;
  }
  :hover {
    background-color: ${({ theme }) =>
      theme.shared.base.colors.backgroundColorFocused};
  }
  margin-right: 10px;
  margin-bottom: 10px;
  margin-top: 10px;
`;

// min-height required here to display scrollbar in Firefox:
// https://stackoverflow.com/questions/28636832/firefox-overflow-y-not-working-with-nested-flexbox
const BaseFrontContentContainer = styled.div`
  height: 100%;
  min-height: 0;
  /* Min-width is set to allow content within this container to shrink completely */
  min-width: 0;
`;

const FrontContentContainer = styled(BaseFrontContentContainer)`
  width: 100%;
`;

const FrontDetailContainer = styled(BaseFrontContentContainer)`
  /* We don't want to shrink our overview or form any smaller than the containing content */
  flex-shrink: 0;
`;

interface FrontPropsBeforeState {
  id: string;
  browsingStage: CollectionItemSets;
}

type FrontProps = FrontPropsBeforeState & {
  selectArticleFragment: (
    articleFragmentId: string,
    collectionId: string,
    frontId: string,
    isSupporting: boolean
  ) => void;
  handleArticleFocus: (
    groupId: string,
    articleFragment: TArticleFragment,
    frontId: string
  ) => void;
  toggleOverview: (open: boolean) => void;
  overviewIsOpen: boolean;
  editorOpenAllCollectionsForFront: typeof editorOpenAllCollectionsForFront;
  editorCloseAllCollectionsForFront: typeof editorCloseAllCollectionsForFront;
};

interface FrontState {
  error: string | void;
  currentlyScrolledCollectionId: string | undefined;
}

class FrontContainer extends React.Component<FrontProps, FrontState> {
  public state = {
    error: undefined,
    currentlyScrolledCollectionId: undefined
  };

  public handleError = (error: string) => {
    this.setState({
      error
    });
  };

  public render() {
    const { overviewIsOpen, id, browsingStage } = this.props;
    return (
      <React.Fragment>
        <div
          style={{
            background: sharedTheme.base.colors.backgroundColorLight,
            display: this.state.error ? 'block' : 'none',
            padding: '1em',
            position: 'absolute',
            width: '100%'
          }}
        >
          {this.state.error || ''}
        </div>
        <FrontWrapper>
          <FrontContentContainer>
            <SectionContentMetaContainer>
              <OverviewHeadingButton onClick={this.handleOpenCollections}>
                <ButtonLabel>Expand all&nbsp;</ButtonLabel>
                <DownCaretIcon fill={sharedTheme.base.colors.text} />
              </OverviewHeadingButton>
              <OverviewHeadingButton onClick={this.handleCloseCollections}>
                <ButtonLabel>Collapse all&nbsp;</ButtonLabel>
                <DownCaretIcon
                  direction="up"
                  fill={sharedTheme.base.colors.text}
                />
              </OverviewHeadingButton>
              {!overviewIsOpen && this.overviewToggle(overviewIsOpen)}
            </SectionContentMetaContainer>
            <FrontContent
              id={id}
              browsingStage={browsingStage}
              handleArticleFocus={this.handleArticleFocus}
              onChangeCurrentCollectionId={this.handleChangeCurrentCollectionId}
            />
          </FrontContentContainer>
          {overviewIsOpen && (
            <FrontDetailContainer>
              {this.overviewToggle(overviewIsOpen)}
              <FrontCollectionsOverview
                id={this.props.id}
                browsingStage={this.props.browsingStage}
                currentCollection={this.state.currentlyScrolledCollectionId}
              />
            </FrontDetailContainer>
          )}
        </FrontWrapper>
      </React.Fragment>
    );
  }

  private overviewToggle = (overviewIsOpen: boolean) => {
    const overviewToggleId = `btn-overview-toggle-${this.props.id}`;

    return (
      <>
        <OverviewToggleContainer
          onClick={() => this.props.toggleOverview(!this.props.overviewIsOpen)}
          active={this.props.overviewIsOpen}
        >
          <OverviewHeading htmlFor={overviewToggleId}>
            {overviewIsOpen ? 'Hide overview' : 'Overview'}
          </OverviewHeading>
          <ButtonCircularCaret
            id={overviewToggleId}
            style={{
              margin: '0'
            }}
            openDir="right"
            active={this.props.overviewIsOpen}
            preActive={false}
            small={true}
          />
        </OverviewToggleContainer>
      </>
    );
  };

  private handleOpenCollections = (e: React.MouseEvent) => {
    e.preventDefault();
    this.props.editorOpenAllCollectionsForFront(
      this.props.id,
      this.props.browsingStage
    );
  };

  private handleCloseCollections = (e: React.MouseEvent) => {
    e.preventDefault();
    this.props.editorCloseAllCollectionsForFront(this.props.id);
  };

  private handleChangeCurrentCollectionId = (id: string) => {
    this.setState({ currentlyScrolledCollectionId: id });
  };

  private handleArticleFocus = (
    e: React.FocusEvent<HTMLDivElement>,
    groupId: string,
    articleFragment: TArticleFragment,
    frontId: string
  ) => {
    this.props.handleArticleFocus(groupId, articleFragment, frontId);
    e.stopPropagation();
  };
}

const mapStateToProps = (state: State, { id }: FrontPropsBeforeState) => {
  return {
    overviewIsOpen: selectIsFrontOverviewOpen(state, id)
  };
};

const mapDispatchToProps = (
  dispatch: Dispatch,
  { id, browsingStage }: FrontPropsBeforeState
) => {
  return {
    initialiseFront: () =>
      dispatch(initialiseCollectionsForFront(id, browsingStage)),
    handleArticleFocus: (
      groupId: string,
      articleFragment: TArticleFragment,
      frontId: string
    ) =>
      dispatch(
        setFocusState({
          type: 'collectionArticle',
          groupId,
          articleFragment,
          frontId
        })
      ),
    toggleOverview: (open: boolean) =>
      dispatch(open ? editorOpenOverview(id) : editorCloseOverview(id)),
    ...bindActionCreators(
      {
        selectArticleFragment: editorSelectArticleFragment,
        editorOpenAllCollectionsForFront,
        editorCloseAllCollectionsForFront
      },
      dispatch
    )
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FrontContainer);
