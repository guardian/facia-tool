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
  selectedArticleFragment: {
    id: string;
    isSupporting: boolean;
    path: string[];
  } | void;
  updateClipboardArticleFragmentMeta: (
    id: string,
    meta: ArticleFragmentMeta
  ) => void;
  clearArticleFragmentSelection: (path: string[]) => void;
}

const ClipboardMeta = (props: Props) => {
  const { selectedArticleFragment } = props;
  return selectedArticleFragment ? (
    <ArticleFragmentForm
      articleFragmentId={selectedArticleFragment.id}
      isSupporting={selectedArticleFragment.isSupporting}
      path={selectedArticleFragment.path}
      key={selectedArticleFragment.id}
      form={selectedArticleFragment.id}
      onSave={meta => {
        props.updateClipboardArticleFragmentMeta(
          selectedArticleFragment.id,
          meta
        );
        props.clearArticleFragmentSelection(selectedArticleFragment.path);
      }}
      frontId="clipboard"
      onCancel={() =>
        props.clearArticleFragmentSelection(selectedArticleFragment.path)
      }
    />
  ) : null;
};

const mapStateToProps = (state: State) => ({
  selectedArticleFragment: selectEditorArticleFragment(state, clipboardId)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  updateClipboardArticleFragmentMeta: (id: string, meta: ArticleFragmentMeta) =>
    dispatch(updateClipboardArticleFragmentMeta(id, meta)),
  clearArticleFragmentSelection: (path: string[]) =>
    dispatch(editorClearArticleFragmentSelection(clipboardId, path))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ClipboardMeta);
