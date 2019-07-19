import React from 'react';
import ArticleFragmentForm from './ArticleFragmentForm';
import FrontCollectionsOverview from './FrontCollectionsOverview';
import { connect } from 'react-redux';
import {
  ArticleFragmentMeta,
  CollectionItemSets
} from 'shared/types/Collection';
import { updateArticleFragmentMeta as updateArticleFragmentMetaAction } from 'actions/ArticleFragments';
import {
  editorClearArticleFragmentSelection,
  selectIsFrontOverviewOpen,
  selectSingleArticleFragmentForm,
  OpenArticleFragmentData
} from 'bundles/frontsUIBundle';
import { Dispatch } from 'types/Store';
import { State } from 'types/State';
import { bindActionCreators } from 'redux';

interface ContainerProps {
  id: string;
  browsingStage: CollectionItemSets;
  currentCollection?: string | undefined;
}

interface ComponentProps extends ContainerProps {
  selectedArticleFragment: OpenArticleFragmentData | undefined;
  updateArticleFragmentMeta: (id: string, meta: ArticleFragmentMeta) => void;
  clearArticleFragmentSelection: (id: string) => void;
  overviewIsOpen: boolean;
}

const FrontsDetailView = ({
  selectedArticleFragment,
  id,
  browsingStage,
  clearArticleFragmentSelection,
  updateArticleFragmentMeta,
  overviewIsOpen,
  currentCollection
}: ComponentProps) => {
  if (selectedArticleFragment) {
    const { id: articleFragmentId } = selectedArticleFragment;
    return (
      <ArticleFragmentForm
        articleFragmentId={articleFragmentId}
        isSupporting={selectedArticleFragment.isSupporting}
        key={articleFragmentId}
        form={articleFragmentId}
        frontId={id}
        onSave={(meta: ArticleFragmentMeta) => {
          updateArticleFragmentMeta(articleFragmentId, meta);
          clearArticleFragmentSelection(articleFragmentId);
        }}
        onCancel={() => clearArticleFragmentSelection(articleFragmentId)}
      />
    );
  }
  if (overviewIsOpen) {
    return (
      <FrontCollectionsOverview
        id={id}
        browsingStage={browsingStage}
        currentCollection={currentCollection}
      />
    );
  }
  return null;
};

const mapStateToProps = (state: State, props: ContainerProps) => ({
  selectedArticleFragment: selectSingleArticleFragmentForm(state, props.id),
  overviewIsOpen: selectIsFrontOverviewOpen(state, props.id)
});

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      updateArticleFragmentMeta: updateArticleFragmentMetaAction,
      clearArticleFragmentSelection: editorClearArticleFragmentSelection
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FrontsDetailView);
