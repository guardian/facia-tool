// @flow

import { type Dispatch } from 'types/Store';
import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { type State } from 'types/State';
import {
  selectEditorArticleFragment,
  editorClearArticleFragmentSelection
} from 'bundles/frontsUIBundle';
import { clipboardId } from 'constants/fronts';
import { updateClipboardArticleFragmentMeta } from 'actions/ArticleFragments';
import type { ArticleFragmentMeta } from 'shared/types/Collection';
import ArticleFragmentForm from './FrontsEdit/ArticleFragmentForm';

type Props = {
  selectedArticleFragmentId: ?string,
  updateClipboardArticleFragmentMeta: (
    id: string,
    meta: ArticleFragmentMeta
  ) => void,
  clearArticleFragmentSelection: () => void
};

const ClipboardMeta = (props: Props) => {
  const { selectedArticleFragmentId } = props;
  return (
    !!selectedArticleFragmentId && (
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
    )
  );
};

const mapStateToProps = (state: State) => ({
  selectedArticleFragmentId: selectEditorArticleFragment(state, clipboardId)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  ...bindActionCreators({ updateClipboardArticleFragmentMeta }, dispatch),
  clearArticleFragmentSelection: (frontId: string) =>
    dispatch(editorClearArticleFragmentSelection(frontId))
});

const mergeProps = (stateProps, dispatchProps, props) => ({
  ...props,
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
