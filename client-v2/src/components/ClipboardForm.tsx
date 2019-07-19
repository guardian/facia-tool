import { Dispatch } from 'types/Store';
import React from 'react';
import { connect } from 'react-redux';
import { State } from 'types/State';
import {
  editorClearArticleFragmentSelection,
  selectSingleArticleFragmentForm
} from 'bundles/frontsUIBundle';
import { clipboardId } from 'constants/fronts';
import { updateClipboardArticleFragmentMeta } from 'actions/ArticleFragments';
import { ArticleFragmentMeta } from 'shared/types/Collection';
import ArticleFragmentForm from './FrontsEdit/ArticleFragmentForm';
import { bindActionCreators } from 'redux';

interface Props {
  selectedArticleFragment: { id: string; isSupporting: boolean } | void;
  updateClipboardArticleFragmentMeta: (
    id: string,
    meta: ArticleFragmentMeta
  ) => void;
  clearArticleFragmentSelection: (articleFragmentId: string) => void;
}

const ClipboardForm = (props: Props) => {
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
        props.clearArticleFragmentSelection(selectedArticleFragment.id);
      }}
      frontId="clipboard"
      onCancel={() =>
        props.clearArticleFragmentSelection(selectedArticleFragment.id)
      }
    />
  ) : null;
};

const mapStateToProps = (state: State) => ({
  selectedArticleFragment: selectSingleArticleFragmentForm(state, clipboardId)
});

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      updateClipboardArticleFragmentMeta,
      clearArticleFragmentSelection: editorClearArticleFragmentSelection
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(ClipboardForm);
