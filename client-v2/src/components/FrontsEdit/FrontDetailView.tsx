import React from 'react';
import ArticleFragmentForm from './ArticleFragmentForm';
import FrontCollectionsOverview from './FrontCollectionsOverview';
import { connect } from 'react-redux';
import {
  ArticleFragmentMeta,
  CollectionItemSets
} from 'shared/types/Collection';
import { updateArticleFragmentMeta } from 'actions/ArticleFragments';
import {
  editorClearArticleFragmentSelection,
  selectEditorArticleFragment
} from 'bundles/frontsUIBundle';
import { Dispatch } from 'types/Store';
import { State } from 'types/State';

interface ContainerProps {
  id: string;
  browsingStage: CollectionItemSets;
}

interface ComponentProps extends ContainerProps {
  selectedArticleFragment: { id: string; isSupporting: boolean } | void;
  updateArticleFragmentMeta: (id: string, meta: ArticleFragmentMeta) => void;
  clearArticleFragmentSelection: (id: string) => void;
}

const FrontsDetailView = ({
  selectedArticleFragment,
  id,
  browsingStage,
  clearArticleFragmentSelection
}: ComponentProps) =>
  selectedArticleFragment ? (
    <ArticleFragmentForm
      articleFragmentId={selectedArticleFragment.id}
      isSupporting={selectedArticleFragment.isSupporting}
      key={selectedArticleFragment.id}
      form={selectedArticleFragment.id}
      frontId={id}
      onSave={(meta: ArticleFragmentMeta) => {
        updateArticleFragmentMeta(selectedArticleFragment.id, meta);
        clearArticleFragmentSelection(id);
      }}
      onCancel={() => clearArticleFragmentSelection(id)}
    />
  ) : (
    <FrontCollectionsOverview id={id} browsingStage={browsingStage} />
  );

const mapStateToProps = (state: State, props: ContainerProps) => ({
  selectedArticleFragment: selectEditorArticleFragment(state, props.id)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  updateArticleFragmentMeta: (id: string, meta: ArticleFragmentMeta) =>
    dispatch(updateArticleFragmentMeta(id, meta)),
  clearArticleFragmentSelection: (frontId: string) =>
    dispatch(editorClearArticleFragmentSelection(frontId))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FrontsDetailView);
