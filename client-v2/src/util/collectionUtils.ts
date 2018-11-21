import React from 'react';
import { ThunkResult } from 'types/Store';
import { Dispatch } from 'types/Store';
import { PosSpec } from 'lib/dnd';
import { ArticleFragment } from 'shared/types/Collection';
import {
  createArticleFragment,
  articleFragmentsReceived
} from 'shared/actions/ArticleFragments';
import { insertArticleFragment } from 'actions/ArticleFragments';
import {
  selectSharedState,
  articleFragmentsSelector
} from 'shared/selectors/shared';
import { InsertArticleFragment } from 'shared/types/Action';
import { cloneFragment } from 'shared/util/articleFragment';

const dropToArticle = (e: React.DragEvent): string | null => {
  const map = {
    text: (url: string) => url,
    capi: (data: string) => data
  };

  for (const [type, fn] of Object.entries(map)) {
    const data = e.dataTransfer.getData(type);
    if (data) {
      return fn(data);
    }
  }

  return null;
};

const handleInsert = (
  to: InsertArticleFragment['payload']['to'],
  id: InsertArticleFragment['payload']['id'],
  persistTo: 'collection' | 'clipboard'
): ThunkResult<void> => {
  return (dispatch: Dispatch, getState) => {
    dispatch(createArticleFragment(id))
      .then(fragment => {
        if (fragment) {
          dispatch(
            insertArticleFragment(persistTo)(
              to,
              id,
              null,
              articleFragmentsSelector(selectSharedState(getState()))
            )
          );
        }
      })
      .catch(() => {
        // @todo: implement once error handling is done
      });
  };
};

const handleMove = (
  to: InsertArticleFragment['payload']['to'],
  fragment: ArticleFragment,
  from: InsertArticleFragment['payload']['from'],
  persistTo: 'collection' | 'clipboard'
): ThunkResult<void> => {
  return (dispatch: Dispatch, getState) => {
    // if from is not null then assume we're copying a moved article fragment
    // into this new position
    const { parent, supporting } = !from
      ? cloneFragment(
          fragment,
          articleFragmentsSelector(selectSharedState(getState()))
        )
      : { parent: fragment, supporting: [] };

    if (!from) {
      dispatch(articleFragmentsReceived([parent, ...supporting]));
    }

    dispatch(
      insertArticleFragment(persistTo)(
        to,
        parent.uuid,
        from,
        articleFragmentsSelector(selectSharedState(getState()))
      )
    );
  };
};

const insertArticleFragmentFromDropEvent = (
  e: React.DragEvent,
  to: PosSpec,
  persistTo: 'collection' | 'clipboard'
): ThunkResult<void> => {
  return (dispatch: Dispatch) => {
    const id = dropToArticle(e);
    if (!id) {
      return;
    }
    dispatch(handleInsert(to, id, persistTo));
  };
};

export { handleMove, handleInsert, insertArticleFragmentFromDropEvent };
