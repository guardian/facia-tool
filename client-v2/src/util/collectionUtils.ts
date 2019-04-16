import React from 'react';
import { ThunkResult, Dispatch } from 'types/Store';
import { PosSpec } from 'lib/dnd';
import { insertArticleFragment } from 'actions/ArticleFragments';
import { CapiArticle } from 'types/Capi';

export type RefDrop = { type: 'REF'; data: string };
export type CAPIDrop = { type: 'CAPI'; data: CapiArticle };

export type MappableDropType = RefDrop | CAPIDrop;

const dropToArticle = (e: React.DragEvent): MappableDropType | null => {
  const map = {
    capi: (data: string): CAPIDrop => ({
      type: 'CAPI',
      data: JSON.parse(data)
    }),
    text: (url: string): RefDrop => ({ type: 'REF', data: url })
  };

  for (const [type, fn] of Object.entries(map)) {
    const data = e.dataTransfer.getData(type);
    if (data) {
      console.log(type, data);
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
    const dropType = dropToArticle(e);
    if (!dropType) {
      return;
    }
    dispatch(insertArticleFragment(to, dropType, persistTo));
  };
};

export { insertArticleFragmentFromDropEvent };
