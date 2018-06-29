// @flow

import type { ThunkAction } from 'types/Store';
import v4 from 'uuid/v4';
import type { Action } from 'types/Action';
import { getClipboard, saveClipboard, getArticles } from 'services/faciaApi';
import { actions as externalArticleActions } from 'shared/bundles/externalArticlesBundle';
import { batchActions } from 'redux-batched-actions';
import { articleFragmentsReceived } from 'shared/actions/ArticleFragments';
import { addPersistMetaToAction } from 'util/storeMiddleware';
import type { NestedArticleFragment } from 'shared/types/Collection';

function removeClipboardArticleFragment(articleFragmentId: string): Action {
  return {
    type: 'REMOVE_CLIPBOARD_ARTICLE_FRAGMENT',
    payload: {
      articleFragmentId
    }
  };
}

function addClipboardArticleFragment(
  articleFragmentId: string,
  index: number
): Action {
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
    getClipboard()
      .then(clipboardContent => {
        const clipboardArticleFragments = clipboardContent.map(content => ({
          ...content,
          uuid: v4()
        }));
        const supportingArticleFragments = clipboardArticleFragments.reduce((fragments, content) => {
          const supportingFragments = (content.meta && content.meta.supporting) || [];
          const supportingWithIds = supportingFragments.map(supporting => ( {...supporting, uuid: v4() }));
          return fragments.concat(supportingWithIds);
        }, []);
        const allArticleFragments = clipboardArticleFragments.concat(supportingArticleFragments);
        const allArticleFragmentsWithIds = allArticleFragments.reduce(
          (fragmentsWithIds, fragment) => {
            const fragmentWithId = { [fragment.uuid]: fragment };
            return { ...fragmentsWithIds, ...fragmentWithId };
          },
          {}
        );
        dispatch(
          batchActions([
            fetchClipboardContentSuccess(
              clipboardArticleFragments.map(content => content.uuid)
            ),
            articleFragmentsReceived(allArticleFragmentsWithIds)
          ])
        );

        return getArticles(allArticleFragments.reduce((ids, content) => {
          const contentId = [content.id];
          const supportingIds = (content.meta && content.meta.supporting.map(supporting => supporting.id)) || [];

          return ids.concat(contentId).concat(supportingIds);
        }, [])).catch(
          error =>
            dispatch(externalArticleActions.fetchError(error, clipboardContent))
        );
      })
      .then(articles => {
        dispatch(externalArticleActions.fetchSuccess(articles));
      })
      .catch(() => {
        // @todo: implement once error handling is done
      });
}
function updateClipboard(clipboardContent: Array<NestedArticleFragment>) {
  return () =>
    saveClipboard(clipboardContent)
    .catch(() => {
      // @todo: implement once error handling is done
    });
}

export {
  fetchClipboardContent,
  updateClipboard,
  addClipboardArticleFragmentWithPersistence as addClipboardArticleFragment,
  removeClipboardArticleFragmentWithPersistence as removeClipboardArticleFragment
};
