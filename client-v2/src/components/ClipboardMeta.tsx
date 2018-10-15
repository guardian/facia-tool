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

type Props = {
  selectedArticleFragmentId: string | void;
  updateClipboardArticleFragmentMeta: (
    id: string,
    meta: ArticleFragmentMeta
  ) => void;
  clearArticleFragmentSelection: () => void;
};

const ClipboardMeta = (props: Props) => {
  const { selectedArticleFragmentId } = props;
  return selectedArticleFragmentId ? (
    <ArticleFragmentForm
      articleFragmentId={selectedArticleFragmentId}
      key={selectedArticleFragmentId}
      form={selectedArticleFragmentId}
      onSave={meta =>
        props.updateClipboardArticleFragmentMeta(
          selectedArticleFragmentId,
          meta
        )
      }
      onCancel={props.clearArticleFragmentSelection}
    />
  ) : null;
};

const mapStateToProps = (state: State) => ({
  selectedArticleFragmentId: selectEditorArticleFragment(state, clipboardId)
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
