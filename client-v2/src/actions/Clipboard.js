// @flow

import type { ThunkAction } from 'types/Store';
import type { Action } from 'types/Action';
import { getClipboard, saveClipboard, getArticles } from 'services/faciaApi';
import { actions as externalArticleActions } from 'shared/bundles/externalArticlesBundle';
import { batchActions } from 'redux-batched-actions';
import { articleFragmentsReceived } from 'shared/actions/ArticleFragments';
import { addPersistMetaToAction } from 'util/storeMiddleware';
import type {
  ArticleFragment,
  NestedArticleFragment
} from 'shared/types/Collection';
import { normaliseClipboard } from 'util/clipboardUtils';

function removeClipboardArticleFragment(articleFragmentId: string) {
  return {
    type: 'REMOVE_CLIPBOARD_ARTICLE_FRAGMENT',
    payload: {
      articleFragmentId
    }
  };
}

function addClipboardArticleFragment(articleFragmentId: string, index: number) {
  return {
    type: 'ADD_CLIPBOARD_ARTICLE_FRAGMENT',
    payload: {
      articleFragmentId,
      index
    }
  };
}

const addClipboardArticleFragmentWithPersistence = addPersistMetaToAction(
  addClipboardArticleFragment,
  {
    persistTo: 'clipboard'
  }
);

const removeClipboardArticleFragmentWithPersistence = addPersistMetaToAction(
  removeClipboardArticleFragment,
  {
    persistTo: 'clipboard'
  }
);

function fetchClipboardContentSuccess(clipboardContent: Array<string>): Action {
  return {
    type: 'FETCH_CLIPBOARD_CONTENT_SUCCESS',
    payload: clipboardContent
  };
}

function fetchClipboardContent(): ThunkAction {
  return (dispatch: Dispatch) =>
    getClipboard().then(clipboardContent => {
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
          fetchClipboardContentSuccess(clipboardArticles),
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
            externalArticleActions.fetchError(
              error,
              'Failed to fetch clipboard'
            )
          );
          return [];
        })
        .then(articles => {
          dispatch(externalArticleActions.fetchSuccess(articles));
        });
    });
}

function updateClipboard(clipboardContent: {
  articles: Array<NestedArticleFragment>
}) {
  return () =>
    saveClipboard(clipboardContent.articles).catch(() => {
      // @todo: implement once error handling is done
    });
}

export {
  fetchClipboardContent,
  updateClipboard,
  addClipboardArticleFragmentWithPersistence as addClipboardArticleFragment,
  removeClipboardArticleFragmentWithPersistence as removeClipboardArticleFragment
};
