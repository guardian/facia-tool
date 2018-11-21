import React from 'react';
import { ThunkResult, Dispatch } from 'types/Store';
import { PosSpec } from 'lib/dnd';
import { insertArticleFragment } from 'actions/ArticleFragments';

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
    dispatch(insertArticleFragment(to, id, persistTo));
  };
};

export { insertArticleFragmentFromDropEvent };
