import { Dispatch } from 'types/Store';
import React from 'react';
import { connect } from 'react-redux';
import { State } from 'types/State';
import {
  selectEditorArticleFragment,
  editorClearArticleFragmentSelection
} from 'bundles/frontsUIBundle';
import { clipboardId } from 'constants/fronts';
import { updateClipboardArticleFragmentMeta } from 'actions/ArticleFragments';
import { ArticleFragmentMeta } from 'shared/types/Collection';
import ArticleFragmentForm from './FrontsEdit/ArticleFragmentForm';

interface Props {
  selectedArticleFragment: { id: string, isSupporting: boolean } | void;
  updateClipboardArticleFragmentMeta: (
    id: string,
    meta: ArticleFragmentMeta
  ) => void;
  clearArticleFragmentSelection: () => void;
}

const ClipboardMeta = (props: Props) => {
  const { selectedArticleFragment } = props;
  return selectedArticleFragment ? (
    <ArticleFragmentForm
      articleFragmentId={selectedArticleFragment.id}
      isSupporting={selectedArticleFragment.isSupporting}
      key={selectedArticleFragment.id}
      form={selectedArticleFragment.id}
      onSave={meta => {
        props.updateClipboardArticleFragmentMeta(
          selectedArticleFragment.id,
          meta
        );
        props.clearArticleFragmentSelection();
      }}
      frontId="clipboard"
      onCancel={props.clearArticleFragmentSelection}
    />
  ) : null;
};

const mapStateToProps = (state: State) => ({
  selectedArticleFragment: selectEditorArticleFragment(state, clipboardId)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  updateClipboardArticleFragmentMeta: (id: string, meta: ArticleFragmentMeta) =>
    dispatch(updateClipboardArticleFragmentMeta(id, meta)),
  clearArticleFragmentSelection: (frontId: string) =>
    dispatch(editorClearArticleFragmentSelection(frontId))
});

const mergeProps = (
  stateProps: ReturnType<typeof mapStateToProps>,
  dispatchProps: ReturnType<typeof mapDispatchToProps>
) => ({
  ...stateProps,
  ...dispatchProps,
  clearArticleFragmentSelection: () =>
    dispatchProps.clearArticleFragmentSelection(clipboardId)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(ClipboardMeta);
