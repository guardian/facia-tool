

import { Dispatch } from 'types/Store';
import { saveClipboard, getArticles } from 'services/faciaApi';
import { actions as externalArticleActions } from 'shared/bundles/externalArticlesBundle';
import { batchActions } from 'redux-batched-actions';
import { articleFragmentsReceived } from 'shared/actions/ArticleFragments';
import {
  ArticleFragment,
  NestedArticleFragment
} from 'shared/types/Collection';
import { normaliseClipboard } from 'util/clipboardUtils';

function updateClipboardContent(clipboardContent: Array<string>) {
  return {
    type: 'UPDATE_CLIPBOARD_CONTENT',
    payload: clipboardContent
  };
}

function storeClipboardContent(clipboardContent: Array<NestedArticleFragment>) {
  return (dispatch: Dispatch) => {
    const normalisedClipboard: {
      clipboard: { articles: Array<string> },
      articleFragments: { [string]: ArticleFragment }
    } = normaliseClipboard({
      articles: clipboardContent
    });
    const clipboardArticles = normalisedClipboard.clipboard.articles;
    const { articleFragments } = normalisedClipboard;

    dispatch(
      batchActions([
        updateClipboardContent(clipboardArticles),
        articleFragmentsReceived(articleFragments)
      ])
    );

    const fragmentIds = Object.values(articleFragments).map(
      // $FlowFixMe Object.values() returns mixed[]
      fragment => fragment.id
    );
    return getArticles(fragmentIds)
      .catch(error => {
        dispatch(
          externalArticleActions.fetchError(error, 'Failed to fetch clipboard')
        );
        return [];
      })
      .then(articles => {
        dispatch(externalArticleActions.fetchSuccess(articles));
      });
  };
}

function updateClipboard(clipboardContent: {
  articles: Array<NestedArticleFragment>
}) {
  return () =>
    saveClipboard(clipboardContent.articles).catch(() => {
      // @todo: implement once error handling is done
    });
}

export { storeClipboardContent, updateClipboard, updateClipboardContent };
